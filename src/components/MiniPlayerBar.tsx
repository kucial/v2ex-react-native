import { useEffect } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { scheduleOnRN } from 'react-native-worklets'
import { Image } from 'expo-image'
import { usePathname } from 'expo-router'

import V2exIcon from '@/components/icons/V2exIcon'

import { usePadLayout } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { useAudioPlayerStore } from '@/stores/audioPlayer'
import { usePlayerUiStore } from '@/stores/playerUi'
import {
  selectScreenBottomBarHeight,
  useUiMetricsStore,
} from '@/stores/uiMetrics'

const TAB_PATHS = ['/feed', '/nodes', '/ai']
const EXPAND_DISTANCE = 40

// Three placements are handled:
// 1. Main tab screens — a `dock` instance rendered inside the tab bar slot,
//    directly above BottomTabBar (no height measurement needed).
// 2. Screens with their own bottom bar (TopicScreen) — the global `overlay`
//    instance docks above the reported bar height.
// 3. Any other screen — the overlay instance sits on the safe-area bottom.
export default function MiniPlayerBar(props: {
  placement?: 'overlay' | 'dock'
}) {
  const placement = props.placement ?? 'overlay'
  const { styles, theme } = useTheme()
  const insets = useSafeAreaInsets()
  const padLayout = usePadLayout()
  const pathname = usePathname()

  const currentAudio = useAudioPlayerStore((state) => state.currentAudio)
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying)
  const isLoading = useAudioPlayerStore((state) => state.isLoading)
  const isBuffering = useAudioPlayerStore((state) => state.status.isBuffering)
  const togglePlayPause = useAudioPlayerStore((state) => state.togglePlayPause)
  const clearCurrentAudio = useAudioPlayerStore(
    (state) => state.clearCurrentAudio,
  )
  const screenBottomBarHeight = useUiMetricsStore(selectScreenBottomBarHeight)
  const expanded = usePlayerUiStore((state) => state.expanded)
  const expand = usePlayerUiStore((state) => state.expand)
  const artworkUrl = currentAudio?.artworkUrl

  const translateX = useSharedValue(0)
  const opacity = useSharedValue(1)

  // Reset the swipe-away animation when new audio starts
  useEffect(() => {
    if (currentAudio) {
      translateX.value = 0
      opacity.value = 1
    }
  }, [currentAudio, translateX, opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }))

  if (!currentAudio) {
    return null
  }

  if (expanded) {
    // the full player covers this bar
    return null
  }

  if (
    placement === 'overlay' &&
    !padLayout.active &&
    TAB_PATHS.includes(pathname)
  ) {
    // tab screens are covered by the `dock` instance inside the tab bar
    return null
  }

  let positionStyle
  if (placement === 'dock') {
    positionStyle = barStyles.dock
  } else {
    let bottom: number
    if (padLayout.active) {
      bottom = padLayout.orientation === 'PORTRAIT' ? 8 : insets.bottom + 8
    } else if (screenBottomBarHeight > 0) {
      // screen-owned bottom bar (e.g. TopicScreen); measured height already
      // includes the safe-area inset
      bottom = screenBottomBarHeight + 4
    } else {
      bottom = insets.bottom + 8
    }
    positionStyle = [barStyles.overlayPosition, { bottom }]
  }

  const dismissGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .onUpdate((event) => {
      translateX.value = event.translationX
    })
    .onEnd(() => {
      if (translateX.value > 30) {
        translateX.value = withSpring(400)
        opacity.value = withTiming(0, { duration: 200 })
        scheduleOnRN(clearCurrentAudio)
      } else {
        translateX.value = withSpring(0)
      }
    })

  const expandGesture = Gesture.Pan()
    .activeOffsetY([-15, 15])
    .onEnd((event) => {
      if (event.translationY < -EXPAND_DISTANCE) {
        scheduleOnRN(expand)
      }
    })

  // Whichever axis the finger commits to first wins.
  const panGesture = Gesture.Race(dismissGesture, expandGesture)

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[positionStyle, animatedStyle]}>
        <View
          style={[
            barStyles.bar,
            styles.overlay,
            { shadowColor: theme.colors.text },
          ]}
        >
          <Pressable
            onPress={expand}
            accessibilityRole='button'
            accessibilityLabel='展开播放器'
            style={({ pressed }) => [
              barStyles.expandArea,
              pressed && barStyles.pressed,
            ]}
          >
            {artworkUrl ? (
              <Image style={barStyles.artwork} source={{ uri: artworkUrl }} />
            ) : (
              <View
                style={[
                  barStyles.artwork,
                  barStyles.artworkFallback,
                  styles.layer2,
                ]}
              >
                <V2exIcon
                  name='musical-note-outline'
                  size={20}
                  color={theme.colors.text_meta}
                />
              </View>
            )}
            <View style={barStyles.info}>
              <Text
                style={[styles.text, styles.text_sm, barStyles.title]}
                numberOfLines={1}
              >
                {currentAudio.title}
              </Text>
              {!!currentAudio.artist && (
                <Text
                  style={[styles.text_meta, styles.text_xs]}
                  numberOfLines={1}
                >
                  {currentAudio.artist}
                </Text>
              )}
            </View>
          </Pressable>
          <Pressable
            onPress={() => togglePlayPause()}
            style={({ pressed }) => [
              barStyles.playButton,
              pressed && barStyles.pressed,
            ]}
          >
            {isLoading || isBuffering ? (
              <ActivityIndicator size='small' color={theme.colors.primary} />
            ) : isPlaying ? (
              <V2exIcon
                name='pause-outline'
                size={26}
                color={theme.colors.primary}
              />
            ) : (
              <V2exIcon
                name='play-outline'
                size={26}
                color={theme.colors.primary}
              />
            )}
          </Pressable>
        </View>
      </Animated.View>
    </GestureDetector>
  )
}

const barStyles = StyleSheet.create({
  overlayPosition: {
    position: 'absolute',
    left: 8,
    right: 8,
    zIndex: 50,
  },
  dock: {
    marginHorizontal: 8,
    marginBottom: 4,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 12,
    paddingLeft: 8,
    paddingRight: 4,
    gap: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  expandArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  artworkFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
  },
  playButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
})
