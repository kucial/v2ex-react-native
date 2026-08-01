import { useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { useTheme } from '@/containers/ThemeService'

export type ScrubberSize = 'compact' | 'expanded'

interface AudioScrubberProps {
  /** Whether this scrubber controls the track that is currently loaded. */
  isActive: boolean
  currentTime: number
  duration: number
  onSeek: (seconds: number) => void | Promise<void>
  size?: ScrubberSize
  /** `compact` lays the times out inline; `expanded` puts them under the bar. */
  style?: ViewStyle
}

const SIZES = {
  compact: { track: 4, thumb: 12, hitHeight: 24 },
  expanded: { track: 6, thumb: 14, hitHeight: 28 },
} as const

export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) {
    return '0:00'
  }
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/**
 * Gesture-driven seek bar shared by the inline `AudioPlayer` and the expanded
 * `FullPlayer`.
 *
 * The `optimisticProgress` bookkeeping is what keeps the thumb from snapping
 * backwards: after a seek we hold the user's position until the player's
 * reported `currentTime` converges on it.
 */
export default function AudioScrubber({
  isActive,
  currentTime,
  duration,
  onSeek,
  size = 'compact',
  style,
}: AudioScrubberProps) {
  const { styles, theme } = useTheme()
  const dims = SIZES[size]

  const [trackWidth, setTrackWidth] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [optimisticProgress, setOptimisticProgress] = useState<number | null>(
    null,
  )

  const progressValue = useSharedValue(0)
  const thumbScale = useSharedValue(1)
  const trackWidthValue = useSharedValue(0)

  const isValidDuration =
    isActive && duration > 0 && isFinite(duration) && !isNaN(duration)

  const canSeek = isValidDuration && trackWidth > 0

  const progress = useMemo(() => {
    if (!isValidDuration) return 0
    const time = currentTime || 0
    if (!isFinite(time) || isNaN(time)) return 0
    return clamp(time / duration, 0, 1)
  }, [currentTime, duration, isValidDuration])

  useEffect(() => {
    if (isSeeking) return
    if (optimisticProgress !== null && isValidDuration) {
      const expectedTime = optimisticProgress * duration
      const delta = Math.abs(currentTime - expectedTime)
      if (delta < 0.5) {
        setOptimisticProgress(null)
        progressValue.value = progress
      } else {
        progressValue.value = optimisticProgress
      }
      return
    }
    progressValue.value = progress
  }, [
    isSeeking,
    progress,
    progressValue,
    optimisticProgress,
    isValidDuration,
    duration,
    currentTime,
  ])

  const startSeeking = () => {
    setIsSeeking(true)
  }

  const applyOptimisticProgress = (ratio: number) => {
    setOptimisticProgress(ratio)
  }

  const finishSeeking = async (ratio: number) => {
    setIsSeeking(false)
    try {
      const seekTime = duration * ratio
      if (isFinite(seekTime) && !isNaN(seekTime)) {
        await onSeek(seekTime)
      }
    } catch (error) {
      console.error('Seek failed:', error)
    }
  }

  const panGesture = Gesture.Pan()
    .enabled(canSeek)
    .onStart((event) => {
      scheduleOnRN(startSeeking)
      thumbScale.value = withSpring(1.3, { damping: 15, stiffness: 300 })
      const ratio = trackWidthValue.value
        ? Math.min(1, Math.max(0, event.x / trackWidthValue.value))
        : 0
      progressValue.value = ratio
      scheduleOnRN(applyOptimisticProgress, ratio)
    })
    .onUpdate((event) => {
      const ratio = trackWidthValue.value
        ? Math.min(1, Math.max(0, event.x / trackWidthValue.value))
        : 0
      progressValue.value = ratio
    })
    .onEnd((event) => {
      const ratio = trackWidthValue.value
        ? Math.min(1, Math.max(0, event.x / trackWidthValue.value))
        : 0
      progressValue.value = ratio
      scheduleOnRN(applyOptimisticProgress, ratio)
      scheduleOnRN(finishSeeking, ratio)
      thumbScale.value = withSpring(1, { damping: 15, stiffness: 300 })
    })
    .onFinalize(() => {
      thumbScale.value = withSpring(1, { damping: 15, stiffness: 300 })
    })

  const tapGesture = Gesture.Tap()
    .enabled(canSeek)
    .onStart((event) => {
      const ratio = trackWidthValue.value
        ? Math.min(1, Math.max(0, event.x / trackWidthValue.value))
        : 0
      progressValue.value = ratio
      scheduleOnRN(applyOptimisticProgress, ratio)
      scheduleOnRN(finishSeeking, ratio)
    })

  const composedGesture = Gesture.Race(panGesture, tapGesture)

  const progressBarAnimatedStyle = useAnimatedStyle<ViewStyle>(
    () => ({
      width: trackWidthValue.value * progressValue.value,
    }),
    [trackWidthValue],
  )

  const thumbAnimatedStyle = useAnimatedStyle<ViewStyle>(() => {
    const rawOffset =
      trackWidthValue.value * progressValue.value - dims.thumb / 2
    // Clamp to prevent overflow at edges
    const thumbOffset = Math.min(
      trackWidthValue.value - dims.thumb,
      Math.max(0, rawOffset),
    )
    return {
      transform: [
        { translateX: thumbOffset },
        { scale: thumbScale.value },
      ] as ViewStyle['transform'],
    }
  }, [trackWidthValue, dims.thumb])

  const currentTimeFormatted = useMemo(
    () => formatTime(isActive ? currentTime : 0),
    [isActive, currentTime],
  )

  const durationFormatted = useMemo(
    () => formatTime(isValidDuration ? duration : 0),
    [duration, isValidDuration],
  )

  const track = (
    <GestureDetector gesture={composedGesture}>
      <View
        style={[
          scrubberStyles.trackContainer,
          { height: dims.hitHeight },
          // compact sits in a row next to the time labels; expanded owns the
          // full width of its column
          size === 'compact'
            ? scrubberStyles.trackFlex
            : scrubberStyles.trackStretch,
        ]}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout
          setTrackWidth(width)
          trackWidthValue.value = width
        }}
        accessibilityLabel='Audio progress bar'
        accessibilityRole='adjustable'
      >
        <View
          style={[
            scrubberStyles.trackBg,
            {
              height: dims.track,
              borderRadius: dims.track / 2,
              backgroundColor: theme.dark ? '#404040' : '#e5e5e5',
            },
          ]}
        >
          {!!isActive && (
            <Animated.View
              style={[
                {
                  height: dims.track,
                  borderRadius: dims.track / 2,
                  backgroundColor: theme.colors.primary,
                },
                progressBarAnimatedStyle,
              ]}
            />
          )}
        </View>
        {!!isActive && (
          <Animated.View
            style={[
              scrubberStyles.thumb,
              {
                width: dims.thumb,
                height: dims.thumb,
                borderRadius: dims.thumb / 2,
              },
              thumbAnimatedStyle,
            ]}
          />
        )}
      </View>
    </GestureDetector>
  )

  if (size === 'expanded') {
    return (
      <View style={style}>
        {track}
        <View style={scrubberStyles.timeRow}>
          <Text style={[styles.text_meta, scrubberStyles.timeText]}>
            {currentTimeFormatted}
          </Text>
          <Text style={[styles.text_meta, scrubberStyles.timeText]}>
            {durationFormatted}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[scrubberStyles.compactRow, style]}>
      <Text style={[scrubberStyles.timeText, styles.text_meta]}>
        {currentTimeFormatted}
      </Text>
      {track}
      <Text style={[scrubberStyles.timeText, styles.text_meta]}>
        {durationFormatted}
      </Text>
    </View>
  )
}

const scrubberStyles = StyleSheet.create({
  compactRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trackContainer: {
    justifyContent: 'center',
  },
  trackFlex: {
    flex: 1,
  },
  trackStretch: {
    alignSelf: 'stretch',
  },
  trackBg: {
    overflow: 'hidden',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  timeText: {
    fontSize: 11,
    paddingHorizontal: 4,
  },
  thumb: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    left: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
})
