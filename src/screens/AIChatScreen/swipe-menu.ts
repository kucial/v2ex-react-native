import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard } from 'react-native'
import { Gesture } from 'react-native-gesture-handler'
import {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

import { shouldOpenSwipeMenu } from './swipe-menu-threshold'

const SWIPE_SPRING = {
  damping: 26,
  mass: 0.8,
  overshootClamping: true,
  stiffness: 220,
}

// The pan lives on the whole screen rather than an edge strip, so it has to
// share the touch with the vertical lists under it: it only claims the finger
// after this much horizontal travel, and drops out entirely once the finger has
// drifted vertically first.
const ACTIVATION_OFFSET_X = 14
const FAIL_OFFSET_Y = 18

function clamp(value: number, minimum: number, maximum: number) {
  'worklet'
  return Math.min(maximum, Math.max(minimum, value))
}

export function useSwipeMenu(menuWidth: number) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const translateX = useSharedValue(0)
  const gestureStartX = useSharedValue(0)
  const previousMenuWidth = useRef(menuWidth)

  const setMenuOpen = useCallback(
    (open: boolean) => {
      setIsMenuOpen(open)
      translateX.value = withSpring(open ? menuWidth : 0, SWIPE_SPRING)
    },
    [menuWidth, translateX],
  )

  useEffect(() => {
    if (previousMenuWidth.current === menuWidth) return
    translateX.value = isMenuOpen ? menuWidth : 0
    previousMenuWidth.current = menuWidth
  }, [isMenuOpen, menuWidth, translateX])

  // `Keyboard.dismiss` is a bound method on a native module instance, which
  // worklets cannot capture — hand `runOnJS` a plain function instead.
  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss()
  }, [])

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        // Closed, only a rightward drag has anywhere to go; open, only a
        // leftward one does. A drag the other way is left to the content.
        .activeOffsetX(isMenuOpen ? -ACTIVATION_OFFSET_X : ACTIVATION_OFFSET_X)
        .failOffsetY([-FAIL_OFFSET_Y, FAIL_OFFSET_Y])
        .onBegin(() => {
          gestureStartX.value = translateX.value
        })
        .onStart(() => {
          // The menu would otherwise slide in over a raised keyboard; drop it
          // as soon as the drag is real, not once the finger lifts.
          runOnJS(dismissKeyboard)()
        })
        .onUpdate((event) => {
          translateX.value = clamp(
            gestureStartX.value + event.translationX,
            0,
            menuWidth,
          )
        })
        .onEnd((event) => {
          const open = shouldOpenSwipeMenu({
            currentPosition: translateX.value,
            menuWidth,
            velocityX: event.velocityX,
          })
          translateX.value = withSpring(open ? menuWidth : 0, SWIPE_SPRING)
          runOnJS(setIsMenuOpen)(open)
        }),
    [dismissKeyboard, gestureStartX, isMenuOpen, menuWidth, translateX],
  )

  const surfaceAnimatedStyle = useAnimatedStyle(() => {
    const progress = menuWidth ? translateX.value / menuWidth : 0
    return {
      borderRadius: interpolate(progress, [0, 1], [0, 28]),
      transform: [{ translateX: translateX.value }],
    }
  })

  const menuAnimatedStyle = useAnimatedStyle(() => {
    const progress = menuWidth ? translateX.value / menuWidth : 0
    return {
      opacity: interpolate(
        progress,
        [0, 0.08, 0.5],
        [0, 0, 1],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateY: interpolate(
            progress,
            [0, 1],
            [8, 0],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(progress, [0, 1], [0.975, 1], Extrapolation.CLAMP),
        },
      ],
    }
  })

  return {
    isMenuOpen,
    menuAnimatedStyle,
    panGesture,
    setMenuOpen,
    surfaceAnimatedStyle,
  }
}
