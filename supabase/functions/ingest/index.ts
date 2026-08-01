/**
 * Analytics ingest.
 *
 * The app POSTs batches here rather than writing to PostgREST directly — the
 * anon key ships inside the app binary and PostgREST has no rate limiting, so a
 * direct-write setup is an open invitation to fill the database.
 *
 * Deploy:
 *   supabase secrets set INGEST_KEY=<random>
 *   supabase functions deploy ingest --no-verify-jwt
 */

import { createClient } from 'jsr:@supabase/supabase-js@2'

/** Mirrors src/lib/tracking/events.ts — unknown names are rejected. */
const ALLOWED_EVENTS = new Set([
  'session.start',
  'nav.session_routes',
  'nav.deep_link',
  'ai.conversation_created',
  'ai.conversation_deleted',
  'ai.conversation_renamed',
  'ai.message_sent',
  'ai.stream_completed',
  'ai.stream_failed',
  'ai.stream_cancelled',
  'ai.message_retried',
  'ai.feedback',
  'ai.persona_changed',
  'ai.token_saved',
  'topic.opened',
  'topic.replied',
  'topic.thanked',
  'topic.created',
  'node.collected',
  'search.performed',
  'audio.play',
  'audio.skip',
  'audio.completed',
  'audio.player_expanded',
  'ui.press',
])

const MAX_EVENTS_PER_BATCH = 100
const MAX_PROPS_BYTES = 2048
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type IncomingEvent = { n?: unknown; p?: unknown; t?: unknown }

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' })

  const expectedKey = Deno.env.get('INGEST_KEY')
  if (!expectedKey || req.headers.get('x-ingest-key') !== expectedKey) {
    return json(401, { error: 'unauthorized' })
  }

  let payload: {
    install_id?: unknown
    app_version?: unknown
    events?: unknown
  }
  try {
    payload = await req.json()
  } catch {
    return json(400, { error: 'invalid_json' })
  }

  const installId = payload.install_id
  if (typeof installId !== 'string' || !UUID_RE.test(installId)) {
    return json(400, { error: 'invalid_install_id' })
  }

  const appVersion =
    typeof payload.app_version === 'string'
      ? payload.app_version.slice(0, 32)
      : null

  if (!Array.isArray(payload.events)) {
    return json(400, { error: 'invalid_events' })
  }
  // 4xx tells the client to DROP the batch, so an oversized batch must never
  // be silently truncated — reject it and let the client fix its batching.
  if (payload.events.length === 0) return json(200, { inserted: 0 })
  if (payload.events.length > MAX_EVENTS_PER_BATCH) {
    return json(400, { error: 'batch_too_large' })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )

  const { data: allowed, error: throttleError } = await supabase.rpc(
    'bump_ingest_throttle',
    { p_install_id: installId },
  )
  if (throttleError) return json(500, { error: 'throttle_failed' })
  if (allowed === false) return json(429, { error: 'rate_limited' })

  const now = Date.now()
  const rows: {
    ts: string
    install_id: string
    name: string
    props: Record<string, unknown>
    app_version: string | null
  }[] = []

  for (const raw of payload.events as IncomingEvent[]) {
    if (!raw || typeof raw.n !== 'string' || !ALLOWED_EVENTS.has(raw.n)) {
      continue
    }
    const props =
      raw.p && typeof raw.p === 'object' && !Array.isArray(raw.p)
        ? (raw.p as Record<string, unknown>)
        : {}
    if (JSON.stringify(props).length > MAX_PROPS_BYTES) continue

    // Trust the client clock only loosely: reject anything implausible so a
    // wrong device clock can't poison the time series.
    const clientTs = typeof raw.t === 'number' ? raw.t : now
    const drift = Math.abs(now - clientTs)
    const ts = drift > 7 * 24 * 60 * 60 * 1000 ? now : clientTs

    rows.push({
      ts: new Date(ts).toISOString(),
      install_id: installId,
      name: raw.n,
      props,
      app_version: appVersion,
    })
  }

  if (rows.length === 0) return json(200, { inserted: 0 })

  const { error } = await supabase.from('events').insert(rows)
  if (error) return json(500, { error: 'insert_failed' })

  return json(200, { inserted: rows.length })
})
