import React, { useRef, useCallback } from 'react'
import { Pressable } from 'react-native'

export default function FixedPressable({ onPress, onPressIn, ...props }) {
  const _touchActivatePositionRef = useRef(null)

  const _onPressIn = useCallback((e) => {
    const { pageX, pageY } = e.nativeEvent

    _touchActivatePositionRef.current = {
      pageX,
      pageY
    }

    onPressIn?.(e)
  }, [])

  const _onPress = useCallback((e) => {
    const { pageX, pageY } = e.nativeEvent

    const absX = Math.abs(_touchActivatePositionRef.current.pageX - pageX)
    const absY = Math.abs(_touchActivatePositionRef.current.pageY - pageY)

    const dragged = absX > 2 || absY > 2
    if (!dragged) {
      onPress?.(e)
    }
  }, [])

  return (
    <Pressable onPressIn={_onPressIn} onPress={_onPress} {...props}>
      {props.children}
    </Pressable>
  )
}
