import { forwardRef, useRef } from 'react'
import composeRefs from '@seznam/compose-react-refs'
import LottieView from 'lottie-react-native'
import colors from 'tailwindcss/colors'

import { useTheme } from '@/containers/ThemeService'

import loadingAnimation from './loading.json'

const Loader = (
  { style, color, size = 28, speed = 1.8, autoPlay = true, ...props },
  ref,
) => {
  const { theme } = useTheme()

  const innerRef = useRef()
  return (
    <LottieView
      onLayout={() => {
        if (autoPlay) {
          innerRef.current.play()
        }
      }}
      speed={speed}
      style={[
        {
          height: size,
        },
        style,
      ]}
      source={loadingAnimation}
      colorFilters={[
        {
          keypath: 'Line_2',
          color: color || theme.colors.refresh_tint,
        },
      ]}
      ref={composeRefs(innerRef, ref)}
      {...props}
    />
  )
}

export default forwardRef(Loader)
