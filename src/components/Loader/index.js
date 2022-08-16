import { forwardRef } from 'react'
import LottieView from 'lottie-react-native'
import loadingAnimation from './loading.json'

const Loader = (
  { style, color = '#333333', size = 28, speed = 1.5, ...props },
  ref
) => {
  return (
    <LottieView
      speed={speed}
      style={[
        {
          height: size
        },
        style
      ]}
      autoPlay
      source={loadingAnimation}
      colorFilters={[
        {
          keypath: 'Line_2',
          color
        }
      ]}
      ref={ref}
      {...props}
    />
  )
}

export default forwardRef(Loader)
