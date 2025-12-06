import { ReactElement } from 'react'
import { Platform, Text, View } from 'react-native'
import Animate, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import BackButton from '@/components/BackButton'

import { useTheme } from '@/containers/ThemeService'

const HEADER_BAR_HEIGHT = 48

function AnimatedHeader(props: {
  title?: string
  scrollY: SharedValue<number>
  hasBorder?: boolean
  headerRight?: ReactElement
  animatedTitle?: boolean
}) {
  const { styles, theme } = useTheme()
  const { scrollY } = props
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const titleStyles = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [50, 150], [0, 1], {
      extrapolateRight: Extrapolation.CLAMP,
    })

    return {
      opacity,
    }
  })

  return (
    <View
      className='w-full flex-row items-center'
      style={[
        {
          height: HEADER_BAR_HEIGHT + insets.top,
          paddingTop: insets.top,
        },
        styles.layer1,
        props.hasBorder && styles.border_b_light,
      ]}
    >
      <View
        style={{
          position: 'absolute',
          left: 4,
          top: insets.top,
          zIndex: 10,
          height: HEADER_BAR_HEIGHT,
          justifyContent: 'center',
        }}
      >
        <BackButton
          tintColor={styles.text.color}
          onPress={() => {
            router.back()
          }}
        />
      </View>
      <Animate.View
        style={[
          {
            position: 'absolute',
            left: 55,
            right: 55,
            height: HEADER_BAR_HEIGHT,
            bottom: 0,
            justifyContent: 'center',
          },
          titleStyles,
        ]}
      >
        <Text
          style={[
            styles.text,
            { textAlign: 'center', fontSize: 17, fontWeight: '500' },
          ]}
          ellipsizeMode='tail'
          numberOfLines={1}
        >
          {props.title}
        </Text>
      </Animate.View>
      {props.headerRight && (
        <View
          style={{
            position: 'absolute',
            right: 4,
            top: insets.top,
            zIndex: 10,
            height: HEADER_BAR_HEIGHT,
            justifyContent: 'center',
          }}
        >
          {props.headerRight}
        </View>
      )}
    </View>
  )
}

export default AnimatedHeader
