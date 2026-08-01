import { useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { useNavigationContainerRef, usePathname } from 'expo-router'

import { navigationIntegration } from '@/lib/sentry'
import { flush, setTrackingEnabled, startTracking, track } from '@/lib/tracking'
import { useAppSettingsStore } from '@/stores/appSettings'

/**
 * Per-session route counts, flushed as ONE event rather than one per
 * navigation. Screen views are by far the highest-frequency interaction, and a
 * row each would dominate the backend's storage budget.
 */
function useRouteAggregation() {
  const pathname = usePathname()
  const counts = useRef<Record<string, number>>({})
  const total = useRef(0)

  useEffect(() => {
    if (!pathname) return
    // Collapse dynamic segments so `/topic/12345` doesn't explode cardinality.
    const route = pathname
      .replace(/\/topic\/\d+/, '/topic/[id]')
      .replace(/\/member\/[^/]+/, '/member/[username]')
      .replace(/\/node\/[^/]+/, '/node/[name]')
      .replace(/\/planet\/[^/]+/, '/planet/[site]')
    counts.current[route] = (counts.current[route] ?? 0) + 1
    total.current += 1
  }, [pathname])

  useEffect(() => {
    const emit = () => {
      if (total.current === 0) return
      track('nav.session_routes', {
        routes: counts.current,
        total: total.current,
      })
      counts.current = {}
      total.current = 0
    }

    const onChange = (status: AppStateStatus) => {
      if (status === 'background' || status === 'inactive') {
        emit()
        void flush()
      }
    }

    const subscription = AppState.addEventListener('change', onChange)
    return () => {
      emit()
      subscription.remove()
    }
  }, [])
}

/**
 * Headless. Keeps the tracking layer in sync with the user's opt-out setting
 * and owns the session lifecycle.
 *
 * The setting is pushed into `@/lib/tracking` rather than read from it, so that
 * module stays free of a dependency on the settings store (which transitively
 * pulls in the whole v2ex client).
 */
export default function TrackingService() {
  const trackingEnabled = useAppSettingsStore(
    (state) => state.data.trackingEnabled,
  )

  // Apply before the first event is recorded.
  setTrackingEnabled(trackingEnabled !== false)

  useEffect(() => {
    setTrackingEnabled(trackingEnabled !== false)
  }, [trackingEnabled])

  useEffect(() => startTracking(), [])

  // Sentry's nav integration is constructed in `@/lib/sentry` but is inert
  // until it's handed the container ref — this is that missing wiring, and it
  // enables screen tracking and time-to-initial-display on crash reports.
  const navigationRef = useNavigationContainerRef()
  useEffect(() => {
    if (navigationRef) {
      navigationIntegration.registerNavigationContainer(navigationRef)
    }
  }, [navigationRef])

  useRouteAggregation()

  return null
}
