import { AppState, AppStateStatus, Platform } from 'react-native'
import Constants from 'expo-constants'
import * as Crypto from 'expo-crypto'

import { getJSON, setJSON } from '@/utils/storage'

import type { EventArgs, EventName } from './events'
import {
  enqueue,
  FLUSH_AT,
  type QueuedEvent,
  readQueue,
  requeue,
  takeBatch,
  writeQueue,
} from './queue'
import { isPermanentFailure, resolveSink, type Sink } from './sink'

export { lengthBucket, MAX_TRACKED_TEXT, truncateForTracking } from './events'
export type { EventName, TrackedEvents } from './events'

const INSTALL_ID_KEY = '$app$/analytics-install-id'
const FLUSH_INTERVAL_MS = 60_000

/**
 * Opt-out state is held here rather than read from the settings store, so this
 * module stays dependency-free (the settings store pulls in the whole v2ex
 * client, which would create an import cycle). `syncTrackingEnabled` pushes the
 * value in — see `TrackingService`.
 */
let enabled = true
let sink: Sink | null = null
let flushTimer: ReturnType<typeof setInterval> | null = null
let flushing = false
let appVersion = ''

function installId(): string {
  const existing = getJSON(INSTALL_ID_KEY) as string | undefined
  if (typeof existing === 'string' && existing.length > 0) {
    return existing
  }
  const next = Crypto.randomUUID()
  setJSON(INSTALL_ID_KEY, next)
  return next
}

export function setTrackingEnabled(next: boolean): void {
  enabled = next
}

export function isTrackingEnabled(): boolean {
  return enabled
}

/**
 * Record an event. Fire-and-forget: this must never throw into a caller and
 * must never block a UI interaction.
 */
export function track<N extends EventName>(
  name: N,
  ...args: EventArgs<N>
): void {
  try {
    if (!enabled) return

    const props = (args[0] ?? {}) as Record<string, unknown>
    const queued: QueuedEvent = { n: name, p: props, t: Date.now() }

    if (enqueue(queued) >= FLUSH_AT) {
      void flush()
    }
  } catch {
    // Telemetry failures are never the user's problem.
  }
}

/** Drain the queue to the active sink. Safe to call concurrently. */
export async function flush(): Promise<void> {
  if (!enabled || flushing) return
  flushing = true
  try {
    const activeSink = sink ?? (sink = resolveSink())
    const { batch, remaining } = takeBatch()
    if (batch.length === 0) return

    // Optimistically remove the batch so new events keep flowing; put it back
    // if the send fails for a retryable reason.
    writeQueue(remaining)

    try {
      await activeSink.send(batch, {
        install_id: installId(),
        app_version: appVersion,
      })
    } catch (err) {
      const permanent = isPermanentFailure(err)
      if (!permanent) {
        requeue(batch)
      }
      if (__DEV__) {
        // Without this a failed POST is indistinguishable from a successful
        // one, which makes debugging the ingest endpoint guesswork.
        console.warn(
          `[track] flush failed via ${activeSink.name} (${
            permanent ? 'dropped' : 'requeued'
          }, ${batch.length} events):`,
          err instanceof Error ? err.message : err,
        )
      }
    }
  } catch (err) {
    if (__DEV__) {
      console.warn('[track] flush error:', err)
    }
  } finally {
    flushing = false
  }
}

function handleAppStateChange(status: AppStateStatus) {
  if (status === 'background' || status === 'inactive') {
    void flush()
  }
}

let started = false

/**
 * Start the periodic/background flush loop and emit `session.start`.
 * Idempotent.
 */
export function startTracking(): () => void {
  if (started) return () => {}
  started = true

  appVersion = Constants.expoConfig?.version ?? 'unknown'
  sink = resolveSink()

  track('session.start', {
    app_version: appVersion,
    os: Platform.OS,
    os_version: String(Platform.Version),
  })

  const subscription = AppState.addEventListener('change', handleAppStateChange)
  flushTimer = setInterval(() => void flush(), FLUSH_INTERVAL_MS)

  // Anything left from a previous run goes out now.
  void flush()

  return () => {
    subscription.remove()
    if (flushTimer) clearInterval(flushTimer)
    flushTimer = null
    started = false
  }
}

/** Test/debug helper — number of events currently buffered on disk. */
export function pendingCount(): number {
  return readQueue().length
}
