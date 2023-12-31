import { forwardRef } from 'react'
import { View } from 'react-native'
import LottieView from 'lottie-react-native'

import { useTheme } from '@/containers/ThemeService'

import heart from './heart.json'

type HeartIconProps = {
  size?: number
  liked?: boolean
}

const HeartIcon = forwardRef<LottieView, HeartIconProps>((props, ref) => {
  const { theme } = useTheme()
  const { liked, size = 24 } = props

  const filledcolor = theme.colors.icon_liked_bg as string
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
          source={heart}
          ref={ref}
          autoPlay={false}
          loop={false}
          speed={1.5}
          colorFilters={[
            {
              keypath: 'outline_heart',
              color: initColor,
            },
            {
              keypath: 'filled_heart',
              color: filledcolor,
            },
          ]}
          progress={liked ? 1 : 0}
        />
      </View>
    </View>
  )
})

HeartIcon.displayName = 'HeartIcon'

export default HeartIcon
