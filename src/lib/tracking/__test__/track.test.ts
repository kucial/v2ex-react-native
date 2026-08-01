import {
  isTrackingEnabled,
  pendingCount,
  setTrackingEnabled,
  track,
} from '@/lib/tracking'
import { clearQueue, readQueue } from '@/lib/tracking/queue'

// Mirrors the real implementation, which JSON round-trips through MMKV — so a
// non-serialisable payload throws here exactly as it would in the app.
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

jest.mock('expo-crypto', () => ({
  randomUUID: () => '00000000-0000-4000-8000-000000000000',
}))

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { version: '1.11.0', extra: {} } },
}))

describe('track()', () => {
  beforeEach(() => {
    clearQueue()
    setTrackingEnabled(true)
  })

  it('queues an event with its name and props', () => {
    track('ai.feedback', { value: 'up' })
    const queued = readQueue()
    expect(queued).toHaveLength(1)
    expect(queued[0].n).toBe('ai.feedback')
    expect(queued[0].p).toEqual({ value: 'up' })
    expect(typeof queued[0].t).toBe('number')
  })

  it('queues propless events with an empty props object', () => {
    track('audio.play')
    expect(readQueue()[0].p).toEqual({})
  })

  it('is a no-op when the user has opted out', () => {
    setTrackingEnabled(false)
    expect(isTrackingEnabled()).toBe(false)

    track('audio.play')
    track('ai.feedback', { value: 'down' })

    expect(pendingCount()).toBe(0)
  })

  it('resumes queueing when tracking is re-enabled', () => {
    setTrackingEnabled(false)
    track('audio.play')
    setTrackingEnabled(true)
    track('audio.play')
    expect(pendingCount()).toBe(1)
  })

  it('never throws, even on a malformed payload', () => {
    const circular: Record<string, unknown> = {}
    circular.self = circular
    expect(() => track('ui.press', circular as unknown as never)).not.toThrow()
  })
})
