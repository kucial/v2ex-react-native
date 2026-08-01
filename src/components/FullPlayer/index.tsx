import { useEffect, useState } from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { scheduleOnRN } from 'react-native-worklets'
import { Image } from 'expo-image'

import AudioScrubber from '@/components/AudioScrubber'
import V2exIcon from '@/components/icons/V2exIcon'

import { useTheme } from '@/containers/ThemeService'
import { useAudioPlayerStore } from '@/stores/audioPlayer'
import { usePlayerUiStore } from '@/stores/playerUi'

import Controls from './Controls'
import QueueSection from './QueueSection'

// Rendered inline in the app tree rather than in a `FullWindowOverlay` /
// `Modal`. Both of those put the player in a separate native window, which
// leaves anything presented from the main window — the sort ActionSheet,
// alerts — drawn *underneath* it, and stops `react-native-pager-view` from
// laying out. `Layout` mounts this last, so an absolute fill still covers the
// tab bar, and `ActionSheetProvider` (a parent) correctly draws above it.
const COLLAPSE_DISTANCE = 120
const COLLAPSE_VELOCITY = 800

// Sheet motion decelerates into place with no overshoot — a spring here reads
// as bouncy at full-screen travel distances.
const ENTER = { duration: 320, easing: Easing.bezier(0.22, 1, 0.36, 1) }
const EXIT = { duration: 240, easing: Easing.bezier(0.55, 0, 0.85, 0.35) }
const SNAP_BACK = { duration: 220, easing: Easing.out(Easing.cubic) }
/** Compact now-playing row — the queue below gets the rest of the sheet. */
const ARTWORK_SIZE = 56

export default function FullPlayer() {
  const { styles, theme } = useTheme()
  const insets = useSafeAreaInsets()
  const { height } = useWindowDimensions()

  const expanded = usePlayerUiStore((s) => s.expanded)
  const collapse = usePlayerUiStore((s) => s.collapse)
  const setSection = usePlayerUiStore((s) => s.setSection)

  const currentAudio = useAudioPlayerStore((s) => s.currentAudio)
  const status = useAudioPlayerStore((s) => s.status)
  const seekTo = useAudioPlayerStore((s) => s.seekTo)

  const translateY = useSharedValue(height)
  const backdropOpacity = useSharedValue(0)
  // Stays true through the exit animation so the sheet can slide out instead
  // of vanishing the moment `expanded` flips.
  const [mounted, setMounted] = useState(expanded)

  useEffect(() => {
    if (expanded) {
      setMounted(true)
      translateY.value = height
      backdropOpacity.value = 0
      translateY.value = withTiming(0, ENTER)
      backdropOpacity.value = withTiming(1, { duration: 240 })
      return
    }

    backdropOpacity.value = withTiming(0, { duration: 180 })
    translateY.value = withTiming(height, EXIT, (finished) => {
      if (finished) {
        scheduleOnRN(setMounted, false)
      }
    })
  }, [expanded, height, translateY, backdropOpacity])

  // Opening with an empty queue (the pad sidebar's 音频 button) should land on
  // something browsable rather than an empty playlist.
  useEffect(() => {
    if (expanded && !currentAudio) {
      setSection('resources')
    }
    // only when the sheet opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded])

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  // The collapse drag is attached to the top region only — the queue list
  // below owns vertical scrolling, and arbitrating between the two would
  // otherwise make both feel unreliable.
  const dragGesture = Gesture.Pan()
    .activeOffsetY([-15, 15])
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY)
    })
    .onEnd((event) => {
      if (
        event.translationY > COLLAPSE_DISTANCE ||
        event.velocityY > COLLAPSE_VELOCITY
      ) {
        scheduleOnRN(collapse)
      } else {
        translateY.value = withTiming(0, SNAP_BACK)
      }
    })

  if (!mounted) {
    return null
  }

  return (
    <View style={playerStyles.root} pointerEvents='box-none'>
      <Animated.View
        style={[playerStyles.backdrop, backdropStyle]}
        pointerEvents='none'
      />
      <Animated.View
        style={[
          playerStyles.sheet,
          styles.layer1,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom },
          sheetStyle,
        ]}
      >
        <GestureDetector gesture={dragGesture}>
          <View style={playerStyles.topRegion}>
            <View style={playerStyles.handleRow}>
              <Pressable
                onPress={collapse}
                hitSlop={12}
                accessibilityRole='button'
                accessibilityLabel='收起播放器'
                style={({ pressed }) => [
                  playerStyles.collapseBtn,
                  pressed && playerStyles.pressed,
                ]}
              >
                <V2exIcon
                  name='chevron-down-outline'
                  size={26}
                  color={theme.colors.text_meta}
                />
              </Pressable>
            </View>

            {/* With nothing loaded the sheet is a pure library browser — the
                pad sidebar opens it that way. */}
            {currentAudio && (
              <>
                <View style={playerStyles.nowPlaying}>
                  {currentAudio.artworkUrl ? (
                    <Image
                      source={{ uri: currentAudio.artworkUrl }}
                      style={playerStyles.artwork}
                    />
                  ) : (
                    <View
                      style={[
                        playerStyles.artwork,
                        playerStyles.artworkFallback,
                        styles.layer2,
                      ]}
                    >
                      <V2exIcon
                        name='musical-note-outline'
                        size={24}
                        color={theme.colors.text_meta}
                      />
                    </View>
                  )}

                  <View style={playerStyles.meta}>
                    <Text
                      style={[
                        styles.text,
                        styles.text_base,
                        playerStyles.title,
                      ]}
                      numberOfLines={2}
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
                </View>

                <AudioScrubber
                  isActive
                  currentTime={status.currentTime}
                  duration={status.duration}
                  onSeek={seekTo}
                  size='expanded'
                  style={playerStyles.scrubber}
                />

                <View style={playerStyles.controls}>
                  <Controls />
                </View>
              </>
            )}
          </View>
        </GestureDetector>

        <QueueSection />
      </Animated.View>
    </View>
  )
}

const playerStyles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // above the sibling MiniPlayerBar that `Layout` renders after us
    zIndex: 100,
    elevation: 100,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topRegion: {
    paddingHorizontal: 20,
  },
  handleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
  },
  collapseBtn: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  nowPlaying: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: 10,
  },
  artworkFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontWeight: '600',
  },
  scrubber: {
    marginBottom: 8,
  },
  controls: {
    marginBottom: 12,
  },
})
