import { useCallback } from 'react'
import { View } from 'react-native'
import Animated, {
  Extrapolate,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { TabBar, TabBarProps } from 'react-native-tab-view'

import { useTheme } from '@/containers/ThemeService'

export default function AnimatedTabBar(
  props: {
    scrollY: SharedValue<number>
    headerHeight: number
    headerCollapsedHeight: number
    setTabBarHeight: (val: number) => void
  } & TabBarProps<any>,
) {
  const { scrollY, headerHeight, headerCollapsedHeight, setTabBarHeight } =
    props
  const { styles } = useTheme()
  const style = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, headerHeight - headerCollapsedHeight],
      [headerHeight, headerCollapsedHeight],
      {
        extrapolateLeft: Extrapolate.CLAMP,
        extrapolateRight: Extrapolate.CLAMP,
      },
    )
    return {
      transform: [{ translateY }],
    }
  })

  const handleLayout = useCallback((e) => {
    setTabBarHeight(e.nativeEvent.layout.height)
  }, [])
  return (
    <Animated.View
      style={[
        {
          top: 0,
          zIndex: 1,
          position: 'absolute',
          width: '100%',
        },
        style,
      ]}>
      <View onLayout={handleLayout}>
        <TabBar
          {...props}
          indicatorContainerStyle={styles.layer1}
          indicatorStyle={styles.btn_primary__bg}
          labelStyle={styles.text}
        />
      </View>
    </Animated.View>
  )
}
