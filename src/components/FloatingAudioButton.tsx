import { useEffect } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { PauseIcon, PlayIcon } from 'react-native-heroicons/outline'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { useTheme } from '@/containers/ThemeService'
import { useAudioPlayerStore } from '@/stores/audioPlayer'

export default function FloatingAudioButton() {
  const { styles, theme } = useTheme()
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying)
  const togglePlayPause = useAudioPlayerStore((state) => state.togglePlayPause)
  const currentAudio = useAudioPlayerStore((state) => state.currentAudio)
  const clearCurrentAudio = useAudioPlayerStore(
    (state) => state.clearCurrentAudio,
  )

  const translateX = useSharedValue(0)
  const opacity = useSharedValue(1)

  // Reset animation values when new audio starts
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

  // Only show if there's audio loaded
  if (!currentAudio) {
    return null
  }

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX
    })
    .onEnd((event) => {
      if (translateX.value > 30) {
        translateX.value = withSpring(200)
        opacity.value = withTiming(0, { duration: 200 })
        runOnJS(clearCurrentAudio)()
      } else {
        translateX.value = withSpring(0)
      }
    })

  const composedGesture = Gesture.Simultaneous(panGesture)

  return (
    <View style={floatingStyles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={animatedStyle}>
          <Pressable
            onPress={() => togglePlayPause()}
            style={({ pressed }) => [
              floatingStyles.button,
              styles.btn_primary__bg,
              {
                shadowColor: theme.colors.text,
              },
              pressed && floatingStyles.pressed,
            ]}
          >
            {isPlaying ? (
              <PauseIcon size={24} color={styles.btn_primary__text.color} />
            ) : (
              <PlayIcon size={24} color={styles.btn_primary__text.color} />
            )}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const floatingStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 34, // safe area bottom approximation + padding
    paddingBottom: 64,
    right: 16,
    zIndex: 50,
  },
  button: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  pressed: {
    opacity: 0.8,
  },
})
