/**
 * Privacy regression guard.
 *
 * `privacy_policy.md` promises that no topic/reply content, search terms or
 * usernames leave the device, and that the ONE disclosed exception — the AI
 * prompt on `ai.message_sent` — is bounded in size. These tests assert that at
 * the only layer that matters: the bytes that actually get queued for upload.
 */
import {
  lengthBucket,
  MAX_TRACKED_TEXT,
  track,
  truncateForTracking,
} from '@/lib/tracking'
import { clearQueue, readQueue } from '@/lib/tracking/queue'

jest.mock('@/utils/storage', () => {
  const store = new Map<string, string>()
  return {
    getJSON: (key: string, fallback?: unknown) => {
      const raw = store.get(key)
      return typeof raw === 'string' ? JSON.parse(raw) : fallback
    },
    setJSON: (key: string, value: unknown) => {
      store.set(key, JSON.stringify(value))
    },
  }
})

jest.mock('expo-crypto', () => ({ randomUUID: () => 'uuid' }))
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '1.11.0', extra: {} } },
}))

/** Everything queued, serialised exactly as it would be POSTed. */
const wire = () => JSON.stringify(readQueue())

const SECRET = '我的银行密码是 hunter2 and my email is a@b.com'

describe('tracking never carries user content', () => {
  beforeEach(clearQueue)

  // The AI prompt is the one disclosed content field — see privacy_policy.md.
  it('ai.message_sent carries the prompt, bucket and conversation id', () => {
    track('ai.message_sent', {
      persona: 'v2ex',
      len: lengthBucket(SECRET.length),
      conversation_id: 'conv_abc',
      text: truncateForTracking(SECRET),
    })

    expect(readQueue()[0].p).toEqual({
      persona: 'v2ex',
      len: 's',
      conversation_id: 'conv_abc',
      text: SECRET,
    })
  })

  it('bounds the tracked prompt so one paste cannot blow the row budget', () => {
    const huge = 'x'.repeat(50_000)
    const out = truncateForTracking(huge)

    expect(out.length).toBeLessThan(MAX_TRACKED_TEXT + 32)
    expect(out.endsWith('…[truncated]')).toBe(true)
    // short text is passed through untouched
    expect(truncateForTracking('hello')).toBe('hello')
  })

  it('lengthBucket only ever emits a fixed set of labels', () => {
    const seen = new Set<string>()
    for (const n of [0, 1, 19, 20, 99, 100, 499, 500, 1999, 2000, 1e6]) {
      seen.add(lengthBucket(n))
    }
    expect([...seen].sort()).toEqual(['l', 'm', 's', 'xl', 'xs'])
  })

  it('no field other than the AI prompt carries prose', () => {
    track('ai.message_sent', {
      persona: 'v2ex',
      len: lengthBucket(SECRET.length),
      conversation_id: 'conv_abc',
      text: SECRET,
    })
    track('ai.stream_failed', { persona: 'v2ex', reason: 'timeout' })
    track('ui.press', { component: 'ReplyRow', action: 'thank' })
    track('topic.opened', { node: 'programmer' })
    track('nav.session_routes', { routes: { '/topic/[id]': 3 }, total: 3 })

    for (const event of readQueue()) {
      for (const [key, value] of Object.entries(event.p)) {
        // `ai.message_sent.text` is the single disclosed content field.
        if (event.n === 'ai.message_sent' && key === 'text') continue
        if (typeof value === 'string') {
          // Enum/bucket/slug values are short by construction. Anything longer
          // is a strong signal that free text slipped into a payload.
          expect(value.length).toBeLessThanOrEqual(40)
        }
      }
    }
  })

  it('route keys are collapsed, so ids and usernames never appear', () => {
    // mirrors the collapsing in TrackingService
    const collapse = (p: string) =>
      p
        .replace(/\/topic\/\d+/, '/topic/[id]')
        .replace(/\/member\/[^/]+/, '/member/[username]')
        .replace(/\/node\/[^/]+/, '/node/[name]')
        .replace(/\/planet\/[^/]+/, '/planet/[site]')

    expect(collapse('/topic/1098765')).toBe('/topic/[id]')
    expect(collapse('/topic/1098765/edit')).toBe('/topic/[id]/edit')
    expect(collapse('/member/kongkx')).toBe('/member/[username]')
    expect(collapse('/node/programmer')).toBe('/node/[name]')
    expect(collapse('/planet/justinyan.eth.limo')).toBe('/planet/[site]')

    track('nav.session_routes', {
      routes: { [collapse('/member/kongkx')]: 1 },
      total: 1,
    })
    expect(wire()).not.toContain('kongkx')
  })
})
