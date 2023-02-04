import { useCallback, useRef } from 'react'
import { NativeScrollEvent } from 'react-native'

export const isBouncingTop = (e: NativeScrollEvent) => {
  const { contentOffset, contentInset } = e
  return contentOffset.y < -contentInset.top
}

export const isBouncingBottom = (e: NativeScrollEvent) => {
  const {
    contentSize,
    contentInset,
    contentOffset,
    layoutMeasurement: bounds,
  } = e
  const contentFillsScrollEdges =
    contentSize.height + contentInset.top + contentInset.bottom >= bounds.height
  return (
    contentFillsScrollEdges &&
    contentOffset.y > contentSize.height - bounds.height + contentInset.bottom
  )
}

type DirectionCallback = (direction: 'down' | 'up') => void
export const useScrollDirection = (options?: {
  callback: DirectionCallback
}) => {
  const lastOffsetY = useRef(0)
  const scrollDirection = useRef('')

  const onScroll = useCallback(
    (e) => {
      const { nativeEvent } = e
      if (isBouncingBottom(nativeEvent) || isBouncingTop(nativeEvent)) {
        return
      }

      const offsetY = nativeEvent.contentOffset.y
      if (offsetY - lastOffsetY.current !== 0) {
        const direction = offsetY - lastOffsetY.current > 0 ? 'down' : 'up'
        if (scrollDirection.current !== direction && options?.callback) {
          options.callback(direction)
        }
        scrollDirection.current = direction
        lastOffsetY.current = offsetY
      }
    },
    [options?.callback],
  )
  const resetDirection = useCallback(() => {
    scrollDirection.current = ''
  }, [])

  return {
    scrollDirection,
    onScroll,
    resetDirection,
  }
}
