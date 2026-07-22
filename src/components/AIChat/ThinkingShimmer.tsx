import { useEffect } from 'react'
import { StyleSheet, Text } from 'react-native'
import Animated, {
  cancelAnimation,
  Easing,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

import { AIChatColors, useAIChatTheme } from './theme'

const LABEL = '正在思考'
const CHARACTERS = Array.from(LABEL)
const SWEEP_OVERFLOW = 0.28

function ShimmerCharacter({
  character,
  index,
  progress,
  colors,
}: {
  character: string
  index: number
  progress: SharedValue<number>
  colors: AIChatColors
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const characterPosition = index / (CHARACTERS.length - 1)
    const sweepPosition =
      progress.value * (1 + SWEEP_OVERFLOW * 2) - SWEEP_OVERFLOW
    const distance = Math.min(Math.abs(characterPosition - sweepPosition), 0.34)

    return {
      color: interpolateColor(
        distance,
        [0, 0.13, 0.34],
        [colors.text, colors.secondaryText, colors.tertiaryText],
      ),
    }
  })

  return <Animated.Text style={animatedStyle}>{character}</Animated.Text>
}

export default function ThinkingShimmer() {
  const { colors } = useAIChatTheme()
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.set(
      withRepeat(
        withTiming(1, { duration: 1250, easing: Easing.linear }),
        -1,
        false,
      ),
    )
    return () => cancelAnimation(progress)
  }, [progress])

  return (
    <Text
      accessibilityLabel={LABEL}
      accessibilityLiveRegion='polite'
      style={thinkingStyles.text}
    >
      {CHARACTERS.map((character, index) => (
        <ShimmerCharacter
          key={`${character}-${index}`}
          character={character}
          index={index}
          progress={progress}
          colors={colors}
        />
      ))}
    </Text>
  )
}

const thinkingStyles = StyleSheet.create({
  text: {
    minHeight: 28,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
    lineHeight: 24,
  },
})
