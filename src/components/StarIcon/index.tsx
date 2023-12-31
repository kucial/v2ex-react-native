import { forwardRef } from 'react'
import { View } from 'react-native'
import LottieView from 'lottie-react-native'

import { useTheme } from '@/containers/ThemeService'

import lottie from './star.json'

type StarIconProps = {
  size?: number
  filled?: boolean
}

const StarIcon = forwardRef<LottieView, StarIconProps>((props, ref) => {
  const { theme } = useTheme()
  const { filled, size = 24 } = props

  const filledcolor = theme.colors.icon_collected_bg as string
  const initColor = theme.colors.text_meta as string
  const offsetSize = size * 2

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          width: offsetSize,
          height: offsetSize,
          marginTop: (offsetSize / 4) * -1,
          marginLeft: (offsetSize / 4) * -1,
        }}>
        <LottieView
          style={{
            width: offsetSize,
            height: offsetSize,
          }}
          source={lottie}
          ref={ref}
          autoPlay={false}
          loop={false}
          speed={1.5}
          colorFilters={[
            {
              keypath: 'outline',
              color: initColor,
            },
            {
              keypath: 'filled',
              color: filledcolor,
            },
          ]}
          progress={filled ? 1 : 0}
        />
      </View>
    </View>
  )
})

StarIcon.displayName = 'StarIcon'

export default StarIcon
