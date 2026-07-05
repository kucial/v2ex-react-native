import { useCallback, useEffect, useId, useRef } from 'react'
import { LayoutChangeEvent } from 'react-native'
import { create } from 'zustand'

type UiMetricsState = {
  // Screen-owned bottom bars (e.g. TopicScreen's BottomBar), keyed by
  // reporter id. Only focused screens report, so MiniPlayerBar can dock
  // above the bar that is actually visible.
  screenBottomBars: Record<string, number>
}

export const useUiMetricsStore = create<UiMetricsState>(() => ({
  screenBottomBars: {},
}))

const setScreenBottomBar = (id: string, height: number | null) => {
  useUiMetricsStore.setState((state) => {
    if (height === null && !(id in state.screenBottomBars)) {
      return state
    }
    const screenBottomBars = { ...state.screenBottomBars }
    if (height === null) {
      delete screenBottomBars[id]
    } else {
      screenBottomBars[id] = height
    }
    return { screenBottomBars }
  })
}

// Returns an onLayout handler for a screen-owned bottom bar. The measured
// height is published while `isFocused` is true and withdrawn on blur or
// unmount (stacked screens keep their bars mounted underneath).
export function useScreenBottomBarReporter(isFocused: boolean) {
  const id = useId()
  const idRef = useRef(id)
  const heightRef = useRef(0)
  const focusedRef = useRef(isFocused)
  focusedRef.current = isFocused

  useEffect(() => {
    const id = idRef.current
    if (isFocused && heightRef.current > 0) {
      setScreenBottomBar(id, heightRef.current)
    } else {
      setScreenBottomBar(id, null)
    }
    return () => {
      setScreenBottomBar(id, null)
    }
  }, [isFocused])

  return useCallback((event: LayoutChangeEvent) => {
    heightRef.current = event.nativeEvent.layout.height
    if (focusedRef.current) {
      setScreenBottomBar(idRef.current, heightRef.current)
    }
  }, [])
}

export const selectScreenBottomBarHeight = (state: UiMetricsState) => {
  let max = 0
  for (const height of Object.values(state.screenBottomBars)) {
    if (height > max) {
      max = height
    }
  }
  return max
}
