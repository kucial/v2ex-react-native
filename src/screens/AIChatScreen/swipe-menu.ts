import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Gesture } from 'react-native-gesture-handler'
import {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

const SWIPE_SPRING = {
  damping: 26,
  mass: 0.8,
  overshootClamping: true,
  stiffness: 220,
}

type SwipeEndState = {
  currentPosition: number
  menuWidth: number
  translationX: number
  velocityX: number
}

export function shouldOpenSwipeMenu({
  currentPosition,
  menuWidth,
  translationX,
  velocityX,
}: SwipeEndState) {
  'worklet'

  if (Math.abs(translationX) > 12 || Math.abs(velocityX) > 160) {
    return translationX + velocityX * 0.05 > 0
  }

  return currentPosition > menuWidth * 0.18
}

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

  const gestures = useMemo(() => {
    const makeGesture = (enabled: boolean) =>
      Gesture.Pan()
        .enabled(enabled)
        .activeOffsetX([-8, 8])
        .failOffsetY([-18, 18])
        .onBegin(() => {
          gestureStartX.value = translateX.value
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
            translationX: event.translationX,
            velocityX: event.velocityX,
          })
          translateX.value = withSpring(open ? menuWidth : 0, SWIPE_SPRING)
          runOnJS(setIsMenuOpen)(open)
        })

    return {
      closeGesture: makeGesture(isMenuOpen),
      openGesture: makeGesture(!isMenuOpen),
    }
  }, [gestureStartX, isMenuOpen, menuWidth, translateX])

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
      opacity: interpolate(progress, [0, 0.08, 0.5], [0, 0, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(progress, [0, 1], [8, 0], Extrapolation.CLAMP),
        },
        {
          scale: interpolate(progress, [0, 1], [0.975, 1], Extrapolation.CLAMP),
        },
      ],
    }
  })

  return {
    closeGesture: gestures.closeGesture,
    isMenuOpen,
    menuAnimatedStyle,
    setMenuOpen,
    surfaceAnimatedStyle,
    openGesture: gestures.openGesture,
  }
}
