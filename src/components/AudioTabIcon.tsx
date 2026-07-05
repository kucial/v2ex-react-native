import { useEffect } from 'react'
import { ColorValue } from 'react-native'
import { MusicalNoteIcon } from 'react-native-heroicons/outline'
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { useAudioPlayerStore } from '@/stores/audioPlayer'

export default function AudioTabIcon(props: {
  color: ColorValue
  size: number
  focused: boolean
}) {
  const { color, size } = props
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying)
  const scale = useSharedValue(1)

  useEffect(() => {
    if (isPlaying) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.18, { duration: 500 }),
          withTiming(1, { duration: 500 }),
        ),
        -1,
        true,
      )
    } else {
      cancelAnimation(scale)
      scale.value = withTiming(1, { duration: 150 })
    }
  }, [isPlaying, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={animatedStyle}>
      <MusicalNoteIcon size={size} color={color} />
    </Animated.View>
  )
}
