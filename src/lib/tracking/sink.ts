import {
  ANALYTICS_DEBUG_INGEST,
  ANALYTICS_INGEST_KEY,
  ANALYTICS_INGEST_URL,
} from '@/env'

import type { QueuedEvent } from './queue'

export type SinkContext = {
  install_id: string
  app_version: string
}

export type Sink = {
  name: string
  send(batch: QueuedEvent[], ctx: SinkContext): Promise<void>
}

/**
 * Dev sink — prints the batch so instrumentation can be verified locally.
 * Props are stringified because the Metro/CDP log capture renders objects as
 * a bare "Object", which hides exactly what you need to inspect.
 */
export const consoleSink: Sink = {
  name: 'console',
  async send(batch) {
    for (const event of batch) {
      let props = ''
      try {
        props = JSON.stringify(event.p)
      } catch {
        props = '<unserializable>'
      }
      console.log(`[track] ${event.n} ${props}`)
    }
  },
}

/**
 * POSTs to the Supabase Edge Function. Throws on non-2xx so the caller
 * re-queues the batch; a dropped batch is better than a lost queue, but a
 * retried batch is better than both.
 */
export const httpSink: Sink = {
  name: 'http',
  async send(batch, ctx) {
    if (!ANALYTICS_INGEST_URL) {
      throw new Error('ANALYTICS_INGEST_URL is not configured')
    }

    const response = await fetch(ANALYTICS_INGEST_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-ingest-key': ANALYTICS_INGEST_KEY ?? '',
      },
      body: JSON.stringify({
        install_id: ctx.install_id,
        app_version: ctx.app_version,
        events: batch,
      }),
    })

    if (!response.ok) {
      // 4xx means the payload is bad — retrying forever would wedge the queue,
      // so let the caller drop it. 5xx / network errors are worth retrying.
      const err = new Error(`ingest failed: ${response.status}`)
      ;(err as Error & { permanent?: boolean }).permanent =
        response.status >= 400 && response.status < 500
      throw err
    }
  },
}

export function isPermanentFailure(err: unknown): boolean {
  return !!(err as { permanent?: boolean } | null)?.permanent
}

/** Posts to the backend AND prints, so a debug session can see what it sent. */
function teeSink(a: Sink, b: Sink): Sink {
  return {
    name: `${a.name}+${b.name}`,
    async send(batch, ctx) {
      await a.send(batch, ctx)
      await b.send(batch, ctx)
    },
  }
}

export function resolveSink(): Sink {
  if (!ANALYTICS_INGEST_URL) {
    return consoleSink
  }
  if (__DEV__) {
    // Dev builds print instead of posting, so local experimentation doesn't
    // pollute the dataset. Set ANALYTICS_DEBUG_INGEST=1 to exercise the real
    // pipeline against a (throwaway) Supabase project — see supabase/README.md.
    return ANALYTICS_DEBUG_INGEST ? teeSink(consoleSink, httpSink) : consoleSink
  }
  return httpSink
}
