import { useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import V2exIcon from '@/components/icons/V2exIcon'

import { useTheme } from '@/containers/ThemeService'
import { useAudioPlayerStore } from '@/stores/audioPlayer'

interface AudioPlayerProps {
  audio: {
    title: string
    url: string
    artist?: string
  }
}

const THUMB_SIZE = 12

export default function AudioPlayerComponent({ audio }: AudioPlayerProps) {
  const { styles, theme } = useTheme()
  const currentAudio = useAudioPlayerStore((s) => s.currentAudio)
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying)
  const status = useAudioPlayerStore((s) => s.status)
  const playAudio = useAudioPlayerStore((s) => s.playAudio)
  const pauseAudio = useAudioPlayerStore((s) => s.pauseAudio)
  const seekTo = useAudioPlayerStore((s) => s.seekTo)

  const isCurrentAudio = currentAudio?.url === audio.url

  const handlePress = () => {
    if (isCurrentAudio) {
      if (isPlaying) {
        pauseAudio()
      } else {
        playAudio(audio)
      }
    } else {
      playAudio(audio)
    }
  }

  const showPlayIcon = !isCurrentAudio || !isPlaying

  const [trackWidth, setTrackWidth] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [optimisticProgress, setOptimisticProgress] = useState<number | null>(
    null,
  )

  const progressValue = useSharedValue(0)
  const thumbScale = useSharedValue(1)
  const trackWidthValue = useSharedValue(0)

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value))

  // Validate duration and check if seeking is possible
  const isValidDuration =
    isCurrentAudio &&
    status.duration > 0 &&
    isFinite(status.duration) &&
    !isNaN(status.duration)

  const canSeek = isCurrentAudio && isValidDuration && trackWidth > 0

  // Calculate progress with validation
  const progress = useMemo(() => {
    if (!isValidDuration) return 0
    const currentTime = status.currentTime || 0
    if (!isFinite(currentTime) || isNaN(currentTime)) return 0
    return clamp(currentTime / status.duration, 0, 1)
  }, [status.currentTime, status.duration, isValidDuration])

  // Update progress value when not seeking
  useEffect(() => {
    if (isSeeking) return
    if (optimisticProgress !== null && isValidDuration) {
      const expectedTime = optimisticProgress * status.duration
      const delta = Math.abs(status.currentTime - expectedTime)
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
    status.duration,
    status.currentTime,
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
      const seekTime = status.duration * ratio
      if (isFinite(seekTime) && !isNaN(seekTime)) {
        await seekTo(seekTime)
      }
    } catch (error) {
      console.error('Seek failed:', error)
    }
  }

  const panGesture = Gesture.Pan()
    .enabled(canSeek)
    .onStart((event) => {
      runOnJS(startSeeking)()
      thumbScale.value = withSpring(1.3, { damping: 15, stiffness: 300 })
      const ratio = trackWidthValue.value
        ? Math.min(1, Math.max(0, event.x / trackWidthValue.value))
        : 0
      progressValue.value = ratio
      runOnJS(applyOptimisticProgress)(ratio)
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
      runOnJS(applyOptimisticProgress)(ratio)
      runOnJS(finishSeeking)(ratio)
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
      runOnJS(applyOptimisticProgress)(ratio)
      runOnJS(finishSeeking)(ratio)
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
      trackWidthValue.value * progressValue.value - THUMB_SIZE / 2
    // Clamp to prevent overflow at edges
    const thumbOffset = Math.min(
      trackWidthValue.value - THUMB_SIZE,
      Math.max(0, rawOffset),
    )
    return {
      transform: [
        { translateX: thumbOffset },
        { scale: thumbScale.value },
      ] as ViewStyle['transform'],
    }
  }, [trackWidthValue])

  // Memoize formatted times
  const currentTimeFormatted = useMemo(
    () => formatTime(isCurrentAudio ? status.currentTime : 0),
    [isCurrentAudio, status.currentTime],
  )

  const durationFormatted = useMemo(
    () => formatTime(isValidDuration ? status.duration : 0),
    [status.duration, isValidDuration],
  )

  return (
    <View style={[audioStyles.container, styles.layer2]}>
      <Pressable
        style={({ pressed }) => [
          audioStyles.playBtn,
          pressed && audioStyles.pressed,
        ]}
        hitSlop={8}
        onPress={handlePress}
        accessibilityLabel={showPlayIcon ? 'Play audio' : 'Pause audio'}
        accessibilityRole='button'
        accessibilityState={{ disabled: false }}
      >
        {showPlayIcon ? (
          <V2exIcon name='play-outline' size={20} color={theme.colors.text} />
        ) : (
          <V2exIcon name='pause-outline' size={20} color={theme.colors.text} />
        )}
      </Pressable>
      <View style={audioStyles.contentWrap}>
        <View style={audioStyles.row}>
          <Text style={[audioStyles.timeText, styles.text_meta]}>
            {currentTimeFormatted}
          </Text>

          <GestureDetector gesture={composedGesture}>
            <View
              style={audioStyles.trackContainer}
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
                  audioStyles.trackBg,
                  { backgroundColor: theme.dark ? '#404040' : '#e5e5e5' },
                ]}
              >
                {!!isCurrentAudio && (
                  <Animated.View
                    style={[
                      audioStyles.progressBar,
                      progressBarAnimatedStyle,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  />
                )}
              </View>
              {!!isCurrentAudio && (
                <Animated.View
                  style={[audioStyles.thumb, thumbAnimatedStyle]}
                />
              )}
            </View>
          </GestureDetector>

          <Text style={[audioStyles.timeText, styles.text_meta]}>
            {durationFormatted}
          </Text>
        </View>
      </View>
    </View>
  )
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) {
    return '0:00'
  }
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const audioStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  playBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
  contentWrap: {
    marginLeft: 8,
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    paddingHorizontal: 4,
  },
  trackContainer: {
    flex: 1,
    height: 24,
    justifyContent: 'center',
  },
  trackBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    left: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
})
