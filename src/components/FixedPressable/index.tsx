import { useCallback, useRef } from 'react'
import { GestureResponderEvent, Pressable, PressableProps } from 'react-native'
import { styled } from 'nativewind'

function FixedPressable({ onPress, onPressIn, ...props }: PressableProps) {
  const _touchActivatePositionRef = useRef(null)

  const _onPressIn = useCallback((e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent

    _touchActivatePositionRef.current = {
      pageX,
      pageY,
    }

    onPressIn?.(e)
  }, [])

  const _onPress = useCallback(
    (e: GestureResponderEvent) => {
      const { pageX, pageY } = e.nativeEvent

      const absX = Math.abs(_touchActivatePositionRef.current.pageX - pageX)
      const absY = Math.abs(_touchActivatePositionRef.current.pageY - pageY)

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

export default styled(FixedPressable)
