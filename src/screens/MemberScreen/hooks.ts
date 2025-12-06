import { useRef, useState } from 'react'
import { Platform } from 'react-native'
import {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface Route {
  key: string
  title: string
}

interface UseAnimatedTabsOptions {
  routes: Route[]
  initialTab?: string
  headerCollapsedOffset?: number
}

interface ListRef {
  key: string
  value: any
}

export function useAnimatedTabs({
  routes,
  initialTab,
  headerCollapsedOffset,
}: UseAnimatedTabsOptions) {
  const insets = useSafeAreaInsets()

  // Calculate collapsed header height
  const defaultCollapsedHeight = 44 + insets.top
  const headerCollapsedHeight = headerCollapsedOffset ?? defaultCollapsedHeight

  // Shared values for scroll synchronization
  const scrollY = useSharedValue(0)
  const listOffset = useSharedValue<Record<string, number | null>>(
    routes.reduce((acc, route) => ({ ...acc, [route.key]: null }), {}),
  )

  // Layout measurements
  const [headerHeight, setHeaderHeight] = useState(0)
  const [tabBarHeight, setTabBarHeight] = useState(0)

  // Tab state
  const [tabIndex, setTabIndex] = useState(() => {
    if (initialTab) {
      const index = routes.findIndex((item) => item.key === initialTab)
      if (index > -1) return index
    }
    return 0
  })

  // Refs for list management
  const listRefArr = useRef<ListRef[]>([])
  const isListGliding = useRef(false)

  // Sync scroll offsets across all tabs
  const syncScrollOffset = () => {
    const curRouteKey = routes[tabIndex].key
    const delta = headerHeight - headerCollapsedHeight

    listRefArr.current.forEach((item) => {
      if (item.key !== curRouteKey) {
        if (scrollY.value < delta && scrollY.value >= 0) {
          if (item.value) {
            item.value.scrollToOffset({
              offset: scrollY.value,
              animated: false,
            })
            listOffset.value[item.key] = scrollY.value
          }
        } else if (scrollY.value >= delta) {
          if (
            listOffset.value[item.key] < delta ||
            listOffset.value[item.key] == null
          ) {
            if (item.value) {
              item.value.scrollToOffset({
                offset: delta,
                animated: false,
              })
              listOffset.value[item.key] = delta
            }
          }
        }
      }
    })
  }

  // Scroll handlers
  const onMomentumScrollBegin = () => {
    isListGliding.current = true
  }

  const onMomentumScrollEnd = () => {
    isListGliding.current = false
    syncScrollOffset()
  }

  const onScrollEndDrag = () => {
    syncScrollOffset()
  }

  const onScroll = useAnimatedScrollHandler(
    {
      onScroll(e) {
        scrollY.value = e.contentOffset.y
        const route = routes[tabIndex].key
        listOffset.value[route] = scrollY.value
      },
    },
    [tabIndex],
  )

  // Register a list ref for a specific tab
  const registerListRef = (routeKey: string) => (ref: any) => {
    if (ref) {
      const found = listRefArr.current.find((e) => e.key === routeKey)
      if (!found) {
        listRefArr.current.push({
          key: routeKey,
          value: ref,
        })
      }
    }
  }

  // Get content container style for a tab
  const getContentContainerStyle = () => ({
    paddingTop: headerHeight + tabBarHeight,
  })

  // Check if a route is focused
  const isFocused = (routeKey: string) => routeKey === routes[tabIndex].key

  return {
    // State
    tabIndex,
    setTabIndex,
    headerHeight,
    setHeaderHeight,
    tabBarHeight,
    setTabBarHeight,
    headerCollapsedHeight,

    // Shared values
    scrollY,
    listOffset,

    // Scroll handlers
    onScroll,
    onMomentumScrollBegin,
    onMomentumScrollEnd,
    onScrollEndDrag,

    // Helpers
    registerListRef,
    getContentContainerStyle,
    isFocused,
  }
}
