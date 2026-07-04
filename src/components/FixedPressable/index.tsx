import { useCallback, useRef } from 'react'
import { GestureResponderEvent, Pressable, PressableProps } from 'react-native'

type TouchPosition = {
  pageX: number
  pageY: number
}

function FixedPressable({ onPress, onPressIn, ...props }: PressableProps) {
  const _touchActivatePositionRef = useRef<TouchPosition | null>(null)

  const _onPressIn = useCallback(
    (e: GestureResponderEvent) => {
      const { pageX, pageY } = e.nativeEvent

      _touchActivatePositionRef.current = {
        pageX,
        pageY,
      }

      onPressIn?.(e)
    },
    [onPressIn],
  )

  const _onPress = useCallback(
    (e: GestureResponderEvent) => {
      const { pageX, pageY } = e.nativeEvent
      const touchActivatePosition = _touchActivatePositionRef.current

      if (!touchActivatePosition) {
        onPress?.(e)
        return
      }

      const absX = Math.abs(touchActivatePosition.pageX - pageX)
      const absY = Math.abs(touchActivatePosition.pageY - pageY)

      const dragged = absX > 2 || absY > 2
      if (!dragged) {
        onPress?.(e)
      }
    },
    [onPress],
  )

  return (
    <Pressable onPressIn={_onPressIn} onPress={_onPress} {...props}>
      {props.children}
    </Pressable>
  )
}

export default FixedPressable
