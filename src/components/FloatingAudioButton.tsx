import { useEffect } from 'react'
import { Pressable, View } from 'react-native'
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
import { useAudioContext } from '@/contexts/AudioContext'

export default function FloatingAudioButton() {
  const { styles, theme } = useTheme()
  const { isPlaying, togglePlayPause, currentAudioUrl, clearCurrentAudio } =
    useAudioContext()

  const translateX = useSharedValue(0)
  const opacity = useSharedValue(1)

  // Reset animation values when new audio starts
  useEffect(() => {
    if (currentAudioUrl) {
      translateX.value = 0
      opacity.value = 1
    }
  }, [currentAudioUrl, translateX, opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }))

  // Only show if there's audio loaded
  if (!currentAudioUrl) {
    return null
  }

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX
    })
    .onEnd((event) => {
      if (translateX.value > 40) {
        translateX.value = withSpring(200)
        opacity.value = withTiming(0, { duration: 200 })
        runOnJS(clearCurrentAudio)()
      } else {
        translateX.value = withSpring(0)
      }
    })

  const composedGesture = Gesture.Simultaneous(panGesture)

  return (
    <View className='absolute bottom-safe pb-16 right-4 z-50'>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={animatedStyle}>
          <Pressable
            onPress={() => togglePlayPause()}
            className='w-[58px] h-[58px] rounded-full items-center justify-center shadow-lg active:opacity-80'
            style={{
              backgroundColor: theme.colors.primary,
              shadowColor: theme.colors.text,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 8,
            }}
          >
            {isPlaying ? (
              <PauseIcon size={24} color={theme.colors.text_primary_inverse} />
            ) : (
              <PlayIcon size={24} color={theme.colors.text_primary_inverse} />
            )}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}
