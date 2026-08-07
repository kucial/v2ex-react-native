/**
 * The event catalog — the single source of truth for what this app tracks.
 *
 * Rules for anything added here:
 *  - name is `domain.action`, props are snake_case
 *  - No usernames, no topic/reply content, no search terms. Buckets and enums
 *    only. Everything here leaves the device.
 *  - keep props small; row size is the binding constraint on the backend.
 *
 * ONE deliberate exception: `ai.message_sent.text` carries the prompt the user
 * typed, so AI answer quality can be reviewed. It is disclosed in
 * privacy_policy.md and is covered by the same 使用数据统计 opt-out. Do not
 * treat it as licence to add content fields elsewhere.
 */

export type LengthBucket = 'xs' | 's' | 'm' | 'l' | 'xl'

export type TrackedEvents = {
  // ── session ──────────────────────────────────────────────────────────────
  'session.start': {
    app_version: string
    os: string
    os_version: string
  }

  // ── navigation ───────────────────────────────────────────────────────────
  /**
   * Aggregated per session rather than emitted per route change — one row per
   * navigation would dominate the whole event volume. See `navigation.ts`.
   */
  'nav.session_routes': {
    routes: Record<string, number>
    total: number
  }
  'nav.deep_link': { target: string }

  // ── ai chat ──────────────────────────────────────────────────────────────
  'ai.conversation_created': { persona: string }
  'ai.conversation_deleted': void
  'ai.conversation_renamed': void
  'ai.message_sent': {
    persona: string
    len: LengthBucket
    /** Groups messages into a thread. A local UUID, not tied to any account. */
    conversation_id: string
    /** The user's prompt, truncated to MAX_TRACKED_TEXT. */
    text: string
  }
  'ai.stream_completed': { persona: string; ms: number; ttft_ms: number }
  'ai.stream_failed': { persona: string; reason: string }
  'ai.stream_cancelled': { persona: string; ms: number }
  'ai.message_retried': { persona: string }
  'ai.feedback': { value: 'up' | 'down' }
  'ai.persona_changed': { persona: string }
  'ai.persona_pinned': { persona: string; pinned: boolean }
  'ai.token_saved': { ok: boolean }

  // ── content ──────────────────────────────────────────────────────────────
  'topic.opened': { node?: string }
  'topic.replied': void
  'topic.thanked': void
  'topic.created': void
  'node.collected': void
  'search.performed': { provider: string }

  // ── audio ────────────────────────────────────────────────────────────────
  'audio.play': void
  'audio.skip': { direction: 'next' | 'prev' }
  'audio.completed': void
  'audio.player_expanded': void

  // ── generic ui ───────────────────────────────────────────────────────────
  /** Migration target for the legacy `usePressBreadcrumb` call sites. */
  'ui.press': { component: string; action: string }
}

export type EventName = keyof TrackedEvents

/** Args tuple is empty for `void` events, so `track('audio.play')` type-checks. */
export type EventArgs<N extends EventName> = TrackedEvents[N] extends void
  ? []
  : [props: TrackedEvents[N]]

export const EVENT_NAMES = [
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
  'ai.persona_pinned',
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
] as const satisfies readonly EventName[]

/**
 * Cap on any tracked free-text field. Keeps a single row well under the
 * ingest function's props limit and stops one pathological paste from
 * dominating the storage budget.
 */
export const MAX_TRACKED_TEXT = 4000

/** Truncate to `MAX_TRACKED_TEXT`, marking it so partial rows are obvious. */
export function truncateForTracking(text: string): string {
  return text.length <= MAX_TRACKED_TEXT
    ? text
    : `${text.slice(0, MAX_TRACKED_TEXT)}…[truncated]`
}

/** Bucket a character count, so aggregates don't have to scan the text. */
export function lengthBucket(len: number): LengthBucket {
  if (len < 20) return 'xs'
  if (len < 100) return 's'
  if (len < 500) return 'm'
  if (len < 2000) return 'l'
  return 'xl'
}
