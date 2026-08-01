import { getJSON, setJSON } from '@/utils/storage'

/**
 * Wire shape. Keys are single letters because every byte here is a byte in
 * MMKV and, eventually, a byte in a Postgres row.
 */
export type QueuedEvent = {
  /** event name */
  n: string
  /** props */
  p: Record<string, unknown>
  /** client timestamp, epoch ms */
  t: number
}

const QUEUE_KEY = '$app$/analytics-queue'

/** Hard ceiling. Telemetry must never grow without bound on a user's device. */
export const MAX_QUEUED = 500
/** Flush once this many events have piled up. */
export const FLUSH_AT = 25
/** Never POST more than this in one request; the ingest function rejects more. */
export const MAX_BATCH = 100

export function readQueue(): QueuedEvent[] {
  const raw = getJSON(QUEUE_KEY, []) as unknown
  return Array.isArray(raw) ? (raw as QueuedEvent[]) : []
}

export function writeQueue(events: QueuedEvent[]): void {
  setJSON(QUEUE_KEY, events)
}

/**
 * Append, dropping the OLDEST events when over capacity — recent activity is
 * more useful than a stale backlog, and this bounds disk use.
 * Returns the queue length after the append.
 */
export function enqueue(event: QueuedEvent): number {
  const next = readQueue()
  next.push(event)
  const trimmed =
    next.length > MAX_QUEUED ? next.slice(next.length - MAX_QUEUED) : next
  writeQueue(trimmed)
  return trimmed.length
}

/** Take up to `MAX_BATCH` events off the front, leaving the rest queued. */
export function takeBatch(): {
  batch: QueuedEvent[]
  remaining: QueuedEvent[]
} {
  const all = readQueue()
  return { batch: all.slice(0, MAX_BATCH), remaining: all.slice(MAX_BATCH) }
}

/**
 * Put a failed batch back at the FRONT so ordering survives a retry, then
 * re-apply the cap (dropping oldest) in case new events arrived meanwhile.
 */
export function requeue(batch: QueuedEvent[]): void {
  const merged = [...batch, ...readQueue()]
  writeQueue(
    merged.length > MAX_QUEUED
      ? merged.slice(merged.length - MAX_QUEUED)
      : merged,
  )
}

export function clearQueue(): void {
  writeQueue([])
}
