import { ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import PagerView from 'react-native-pager-view'
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

import { useTheme } from '@/containers/ThemeService'

import { ProfileCoordinatorTabRenderProps, ProfileTab } from './types'

export type ProfileCoordinatorProps = {
  tabs: ProfileTab[]
  /** Collapsed header height (dp) — the pinned title-bar + status-bar inset. */
  collapsedHeaderHeight: number
  /** Expanded header height (dp). Drives the content inset + collapse distance. */
  headerHeight: number
  initialTabKey?: string
  /** Header subtree, rendered at exactly `headerHeight`. */
  header: ReactNode
  /** Shared value the header consumes for its collapse transitions — driven here
   *  from the active list's scroll (the same value passed to the header). */
  headerScrollY: SharedValue<number>
  contentPaddingBottom?: number
  /** Fired when the active tab changes (tap or swipe). Lets the host e.g. toggle
   *  the stack swipe-back gesture so a non-first tab pages instead of popping. */
  onTabChange?: (event: { index: number; key: string }) => void
  renderScene: (
    tabKey: string,
    props: ProfileCoordinatorTabRenderProps,
  ) => ReactNode
}

/** Inline tab-bar row height (matches the `h-[44]` cells below). */
const TAB_BAR_HEIGHT = 44

function indexOfKey(tabs: ProfileTab[], key: string | undefined): number {
  const i = tabs.findIndex((t) => t.key === key)
  return i < 0 ? 0 : i
}

/** Scroll a freshly-mounted list/scroll-view to `offset` (dp), retrying a few
 *  frames since FlashList isn't immediately scrollable after mount. */
function scrollInstanceToOffset(instance: any, offset: number, attempt = 0) {
  if (!instance || offset < 0 || attempt > 8) return
  const node = instance.getNode?.() ?? instance
  if (typeof node.scrollToOffset === 'function') {
    node.scrollToOffset({ offset, animated: false })
  } else if (typeof node.scrollTo === 'function') {
    node.scrollTo({ y: offset, animated: false })
  } else {
    return
  }
  // Re-apply on the next frames in case the first call landed before the
  // content was measurable (FlashList) — idempotent, non-animated.
  requestAnimationFrame(() =>
    scrollInstanceToOffset(instance, offset, attempt + 1),
  )
}

/** Scroll a list/scroll-view to `y` (dp) once, no retry (used while dragging). */
function scrollInstanceOnce(instance: any, y: number) {
  if (!instance) return
  const node = instance.getNode?.() ?? instance
  if (typeof node.scrollToOffset === 'function') {
    node.scrollToOffset({ offset: Math.max(0, y), animated: false })
  } else if (typeof node.scrollTo === 'function') {
    node.scrollTo({ y: Math.max(0, y), animated: false })
  }
}

/**
 * Collapsing-header profile coordinator (plain RN + Reanimated, cross-platform).
 *
 * Layout is an **overlay**:
 *   - The tab pages live in a `react-native-pager-view` filling the screen; the
 *     active page's list is inset by `headerHeight + tabBar` so it scrolls under
 *     the header.
 *   - An absolute overlay on top hosts the header + a pinned tab bar. The active
 *     list's scroll feeds a Reanimated `headerScrollY`: the header self-collapses
 *     (title bar pins, avatar shrinks, cover parallaxes) and the tab bar is an
 *     `Animated.View` translated by the same value — so they can never desync.
 *     `box-none` lets touches in the overlay's transparent area reach the pager.
 *
 * Collapse is shared across tabs (switching/swiping syncs the new page to the
 * current offset). Dragging on the header scrolls the active list (with a fling).
 */
export default function ProfileCoordinator(props: ProfileCoordinatorProps) {
  const {
    tabs,
    collapsedHeaderHeight,
    headerHeight,
    initialTabKey,
    header,
    headerScrollY,
    contentPaddingBottom = 0,
    onTabChange,
    renderScene,
  } = props

  const { styles, theme } = useTheme()

  const [activeKey, setActiveKey] = useState(
    initialTabKey && tabs.some((t) => t.key === initialTabKey)
      ? initialTabKey
      : tabs[0]?.key,
  )

  const pagerPosition = useSharedValue(0)
  const pagerState = useSharedValue<'idle' | 'dragging' | 'settling'>('idle')

  const pagerRef = useRef<PagerView>(null)

  // Per-tab list/scroll-view instances + stable ref setters. A newly-mounted
  // page is scrolled to the active list's current scroll (headerScrollY) so the
  // header stays put across swipes/switches.
  const listRefs = useRef<Record<string, unknown>>({})
  const listRefSetters = useMemo(() => {
    const setters: Record<string, (instance: unknown) => void> = {}
    for (const tab of tabs) {
      setters[tab.key] = (instance: unknown) => {
        if (instance) {
          listRefs.current[tab.key] = instance
          scrollInstanceToOffset(instance, headerScrollY.value)
        } else {
          delete listRefs.current[tab.key]
        }
      }
    }
    return setters
  }, [tabs, headerScrollY])

  const syncPageToOffset = useCallback(
    (key: string) => {
      scrollInstanceToOffset(listRefs.current[key], headerScrollY.value)
    },
    [headerScrollY],
  )

  // The active list's scroll drives the header's collapse transitions. One
  // animated handler is shared by every page (only the on-screen page scrolls
  // vertically), writing the offset on the UI thread for a smooth header.
  const scrollHandler = useAnimatedScrollHandler((e) => {
    headerScrollY.value = e.contentOffset.y
  })

  // --- Drag-on-header → scroll the active list (so the header region scrolls
  // the page too, with a fling). -------------------------------------------
  const activeKeyRef = useRef(activeKey)
  activeKeyRef.current = activeKey
  const dragStartRef = useRef(0)
  const flingRafRef = useRef<number | null>(null)

  const scrollActiveTo = useCallback((y: number) => {
    scrollInstanceOnce(listRefs.current[activeKeyRef.current], y)
  }, [])

  const cancelFling = useCallback(() => {
    if (flingRafRef.current != null) {
      cancelAnimationFrame(flingRafRef.current)
      flingRafRef.current = null
    }
  }, [])

  const startFling = useCallback(
    (velocityY: number) => {
      if (Math.abs(velocityY) < 80) return
      let v = velocityY // dp/s; +down (expand), -up (collapse/scroll content)
      let y = headerScrollY.value
      let last = Date.now()
      const tick = () => {
        const now = Date.now()
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now
        v *= Math.exp(-3 * dt) // friction
        y = y - v * dt
        if (y <= 0) {
          scrollActiveTo(0)
          flingRafRef.current = null
          return
        }
        scrollActiveTo(y)
        if (Math.abs(v) < 60) {
          flingRafRef.current = null
          return
        }
        flingRafRef.current = requestAnimationFrame(tick)
      }
      flingRafRef.current = requestAnimationFrame(tick)
    },
    [scrollActiveTo, headerScrollY],
  )

  const headerPan = useMemo(
    () =>
      Gesture.Pan()
        // Activate only on a real vertical drag so header buttons stay tappable
        // and horizontal swipes fall through to the pager.
        .activeOffsetY([-8, 8])
        .failOffsetX([-14, 14])
        .onBegin(() => {
          cancelFling()
          dragStartRef.current = headerScrollY.value
        })
        .onUpdate((e) => {
          scrollActiveTo(dragStartRef.current - e.translationY)
        })
        .onEnd((e) => {
          startFling(e.velocityY)
        })
        .runOnJS(true),
    [cancelFling, scrollActiveTo, startFling, headerScrollY],
  )

  const { height: windowHeight } = useWindowDimensions()
  // Measured viewport (the full-screen container). useWindowDimensions
  // under-reports height on an edge-to-edge screen, so prefer the measured value.
  const [viewportHeight, setViewportHeight] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(0)
  const onContainerLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    setViewportHeight((prev) => (prev === height ? prev : height))
    setViewportWidth((prev) => (prev === width ? prev : width))
  }

  // Active-tab underline indicator: track the pager position (fractional page
  // index) so it slides + resizes between tabs during a swipe, sized to each
  // tab's label width.
  const pagerPos = useSharedValue(indexOfKey(tabs, activeKey))
  const [labelWidths, setLabelWidths] = useState<number[]>(() =>
    tabs.map(() => 0),
  )
  const onLabelLayout = (index: number) => (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width
    setLabelWidths((prev) => {
      if (prev[index] === w) return prev
      const next = prev.slice()
      next[index] = w
      return next
    })
  }
  const indicatorStyle = useAnimatedStyle(() => {
    const n = tabs.length
    if (!viewportWidth || n === 0) return { width: 0, opacity: 0 }
    const tabW = viewportWidth / n
    const indices = tabs.map((_, i) => i)
    const w = interpolate(pagerPos.value, indices, labelWidths)
    const center = (pagerPos.value + 0.5) * tabW
    return {
      width: w,
      opacity: w > 0 ? 1 : 0,
      transform: [{ translateX: center - w / 2 }],
    }
  }, [viewportWidth, labelWidths, tabs.length])

  // The list is full-screen behind the header overlay, so its content is inset
  // down by the header + tab bar.
  const contentTopInset = headerHeight + TAB_BAR_HEIGHT

  // Guarantee every tab — even short/empty ones — can scroll far enough to fully
  // collapse the header (and stay collapsed when switched into): the content must
  // exceed the viewport by at least the collapse distance.
  const collapseDistance = Math.max(0, headerHeight - collapsedHeaderHeight)
  const contentMinHeight = (viewportHeight || windowHeight) + collapseDistance

  // Tab bar pins under the collapsing header: translate up by the scroll offset,
  // clamped to the collapse distance — same source as the header, so in sync.
  const tabBarStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: -Math.min(
          Math.max(headerScrollY.value, 0),
          collapseDistance,
        ),
      },
    ],
  }))

  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.key === activeKey),
  )

  const sceneProps = (
    tab: ProfileTab,
    index: number,
  ): ProfileCoordinatorTabRenderProps => ({
    tabKey: tab.key,
    tabIndex: index,
    // Focus the active page + its neighbors so a swipe lands on ready content.
    isFocused: Math.abs(index - activeIndex) <= 1,
    contentContainerStyle: {
      paddingTop: contentTopInset,
      paddingBottom: contentPaddingBottom,
      minHeight: contentMinHeight,
    },
    listProps: {
      ref: listRefSetters[tab.key],
      onScroll: scrollHandler,
      onScrollEndDrag: undefined,
      onMomentumScrollBegin: undefined,
      onMomentumScrollEnd: undefined,
      scrollEventThrottle: 16,
    },
    scrollViewProps: {
      ref: listRefSetters[tab.key],
      onScroll: scrollHandler,
      onScrollEndDrag: undefined,
      onMomentumScrollBegin: undefined,
      onMomentumScrollEnd: undefined,
      scrollEventThrottle: 16,
      showsVerticalScrollIndicator: true,
    },
    pagerPosition,
    pagerState,
  })

  return (
    <View style={{ flex: 1 }} onLayout={onContainerLayout}>
      {/* List layer — a horizontal pager of full-screen pages, drawn behind the
          overlay. Each page keeps its own scroll. */}
      <PagerView
        ref={pagerRef}
        style={StyleSheet.absoluteFill}
        initialPage={activeIndex}
        onPageScroll={(e: {
          nativeEvent: { position: number; offset: number }
        }) => {
          pagerPos.value = e.nativeEvent.position + e.nativeEvent.offset
        }}
        onPageSelected={(e: { nativeEvent: { position: number } }) => {
          const index = e.nativeEvent.position
          const tab = tabs[index]
          if (tab) {
            setActiveKey(tab.key)
            syncPageToOffset(tab.key)
            onTabChange?.({ index, key: tab.key })
          }
        }}
        onPageScrollStateChanged={(e: {
          nativeEvent: { pageScrollState: string }
        }) => {
          // When a swipe starts, pre-scroll the other pages to the current
          // offset so the incoming page doesn't reveal an expanded gap.
          if (e.nativeEvent.pageScrollState === 'dragging') {
            for (const tab of tabs) {
              if (tab.key !== activeKey) syncPageToOffset(tab.key)
            }
          }
        }}
      >
        {tabs.map((tab, index) => (
          <View key={tab.key} collapsable={false} style={{ flex: 1 }}>
            {renderScene(tab.key, sceneProps(tab, index))}
          </View>
        ))}
      </PagerView>

      {/* Header overlay — absolute, hosting the header + tab bar. Collapse is
          driven by the Reanimated headerScrollY (header self-collapses, tab bar
          translates by the same value). box-none lets touches in the transparent
          area reach the pager behind. */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: headerHeight + TAB_BAR_HEIGHT,
        }}
        pointerEvents='box-none'
      >
        {/* Header — drag vertically to scroll/collapse the active list
            (activeOffsetY keeps the header's buttons tappable). */}
        <GestureDetector gesture={headerPan}>
          <View collapsable={false} style={{ height: headerHeight }}>
            {header}
          </View>
        </GestureDetector>

        {/* Pinned tab bar (translated by scrollY, in sync with the header). */}
        <Animated.View
          collapsable={false}
          className='flex-row'
          style={[
            styles.layer1,
            styles.border_b_light,
            { height: TAB_BAR_HEIGHT },
            tabBarStyle,
          ]}
        >
          {tabs.map((tab, index) => (
            <Pressable
              key={tab.key}
              className='flex-1 h-[44] items-center justify-center active:opacity-50'
              onPress={() => pagerRef.current?.setPage(index)}
            >
              <Text
                onLayout={onLabelLayout(index)}
                style={[
                  styles.text_sm,
                  tab.key === activeKey
                    ? [styles.text_primary, { fontWeight: '600' }]
                    : [styles.text, { fontWeight: '400' }],
                ]}
              >
                {tab.title}
              </Text>
            </Pressable>
          ))}

          {/* Active-tab underline indicator (slides + resizes with the pager). */}
          <Animated.View
            pointerEvents='none'
            style={[
              {
                position: 'absolute',
                left: 0,
                bottom: 0,
                height: 2,
                borderRadius: 2,
                backgroundColor: theme.colors.primary,
              },
              indicatorStyle,
            ]}
          />
        </Animated.View>
      </View>
    </View>
  )
}
