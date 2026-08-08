import { useEffect, useState } from 'react'
import { StyleSheet, Text } from 'react-native'
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import MaskedView from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'

import { useAIChatTheme } from './theme'

const LABEL = '正在思考'
const DURATION = 1250

/**
 * Width of the sweeping gradient as a multiple of the label width. The
 * highlight sits in the middle of it, so the band has to be wider than the
 * label for the bright core to travel all the way across.
 */
const SWEEP_WIDTH_RATIO = 2.5

/**
 * Where the highlight sits inside the gradient. Tight stops around the midpoint
 * keep the bright core narrow, so it reads as a moving highlight rather than
 * the whole label brightening and dimming.
 */
const GRADIENT_LOCATIONS = [0, 0.42, 0.5, 0.58, 1] as const

export default function ThinkingShimmer() {
  const { colors } = useAIChatTheme()
  const progress = useSharedValue(0)
  const [labelWidth, setLabelWidth] = useState(0)

  useEffect(() => {
    progress.set(
      withRepeat(
        withTiming(1, { duration: DURATION, easing: Easing.linear }),
        -1,
        false,
      ),
    )
    return () => cancelAnimation(progress)
  }, [progress])

  const sweepWidth = labelWidth * SWEEP_WIDTH_RATIO

  const sweepStyle = useAnimatedStyle(() => {
    // Travel from fully off the leading edge to fully off the trailing edge, so
    // the highlight enters and exits cleanly instead of popping at the bounds.
    const from = -sweepWidth
    const to = labelWidth
    return {
      width: sweepWidth,
      transform: [{ translateX: from + (to - from) * progress.value }],
    }
  })

  return (
    <MaskedView
      // The mask is the text itself, so the gradient is clipped to the glyphs.
      // Unlike a per-character colour ramp this sweeps *within* each glyph,
      // giving a continuous highlight rather than one quantised to 4 steps.
      maskElement={
        <Text style={[thinkingStyles.text, thinkingStyles.mask]}>{LABEL}</Text>
      }
      style={thinkingStyles.container}
    >
      {/* Base colour shows wherever the sweep is not. */}
      <Text
        accessibilityLabel={LABEL}
        accessibilityLiveRegion='polite'
        onLayout={(event) => setLabelWidth(event.nativeEvent.layout.width)}
        style={[thinkingStyles.text, { color: colors.mutedText }]}
      >
        {LABEL}
      </Text>
      {labelWidth > 0 && (
        <Animated.View style={[thinkingStyles.sweep, sweepStyle]}>
          <LinearGradient
            colors={
              [
                colors.mutedText,
                colors.secondaryText,
                colors.text,
                colors.secondaryText,
                colors.mutedText,
              ] as const
            }
            locations={GRADIENT_LOCATIONS}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </MaskedView>
  )
}

const thinkingStyles = StyleSheet.create({
  container: {
    // MaskedView needs an intrinsic size; the text inside establishes it.
    alignSelf: 'flex-start',
  },
  text: {
    minHeight: 28,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  mask: {
    // Any opaque colour works: only the alpha of the mask is used.
    color: '#000',
    backgroundColor: 'transparent',
  },
  sweep: {
    // Width and horizontal offset come from the animated style.
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
})
