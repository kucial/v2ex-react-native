import {
  clearQueue,
  enqueue,
  MAX_BATCH,
  MAX_QUEUED,
  type QueuedEvent,
  readQueue,
  requeue,
  takeBatch,
  writeQueue,
} from '@/lib/tracking/queue'

// Mirrors the real implementation, which JSON round-trips through MMKV.
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

const event = (n: string): QueuedEvent => ({ n, p: {}, t: 1 })

describe('tracking queue', () => {
  beforeEach(() => {
    clearQueue()
  })

  it('appends and reports the new length', () => {
    expect(enqueue(event('a'))).toBe(1)
    expect(enqueue(event('b'))).toBe(2)
    expect(readQueue().map((e) => e.n)).toEqual(['a', 'b'])
  })

  it('drops the OLDEST events once over capacity', () => {
    for (let i = 0; i < MAX_QUEUED + 10; i += 1) {
      enqueue(event(`e${i}`))
    }
    const queued = readQueue()
    expect(queued).toHaveLength(MAX_QUEUED)
    // the first 10 should have been evicted, newest retained
    expect(queued[0].n).toBe('e10')
    expect(queued[queued.length - 1].n).toBe(`e${MAX_QUEUED + 9}`)
  })

  it('takes at most MAX_BATCH and leaves the rest queued', () => {
    for (let i = 0; i < MAX_BATCH + 5; i += 1) {
      enqueue(event(`e${i}`))
    }
    const { batch, remaining } = takeBatch()
    expect(batch).toHaveLength(MAX_BATCH)
    expect(remaining).toHaveLength(5)
    expect(batch[0].n).toBe('e0')
    expect(remaining[0].n).toBe(`e${MAX_BATCH}`)
  })

  it('requeues a failed batch at the front so ordering survives a retry', () => {
    writeQueue([event('new1'), event('new2')])
    requeue([event('old1'), event('old2')])
    expect(readQueue().map((e) => e.n)).toEqual([
      'old1',
      'old2',
      'new1',
      'new2',
    ])
  })

  it('re-applies the cap when requeueing', () => {
    writeQueue(Array.from({ length: MAX_QUEUED }, (_, i) => event(`n${i}`)))
    requeue([event('old')])
    const queued = readQueue()
    expect(queued).toHaveLength(MAX_QUEUED)
    // 'old' went to the front, so the cap evicted from the front again
    expect(queued.some((e) => e.n === 'old')).toBe(false)
  })

  it('tolerates a corrupt persisted value', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const storage = require('@/utils/storage')
    storage.setJSON('$app$/analytics-queue', 'not-an-array')
    expect(readQueue()).toEqual([])
  })
})
