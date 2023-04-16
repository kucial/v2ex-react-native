import { forwardRef, useRef } from 'react'
import { ViewStyle } from 'react-native'
import composeRefs from '@seznam/compose-react-refs'
import LottieView from 'lottie-react-native'

import { useTheme } from '@/containers/ThemeService'

import loadingAnimation from './loading.json'

type LoaderProps = {
  style?: ViewStyle
  color?: string
  size?: number
  speed?: number
  autoPlay?: boolean
}
const Loader = forwardRef<LottieView, LoaderProps>(
  ({ style, color, size = 28, speed = 2, autoPlay = true, ...props }, ref) => {
    const { theme } = useTheme()

    const innerRef = useRef<LottieView>()
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
            color: color || theme.colors.primary,
          },
        ]}
        ref={composeRefs(innerRef, ref)}
        {...props}
      />
    )
  },
)

Loader.displayName = 'Loader'

export default Loader
