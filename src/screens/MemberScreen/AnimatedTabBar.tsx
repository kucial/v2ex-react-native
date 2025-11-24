import { useCallback, useMemo } from 'react'
import { useWindowDimensions, View, ViewStyle } from 'react-native'
import Animated, {
  Extrapolation,
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
    tabCount: number
    indicatorWidth?: number
    containerWidth?: number
  } & TabBarProps<any>,
) {
  const {
    scrollY,
    headerHeight,
    headerCollapsedHeight,
    setTabBarHeight,
    tabCount,
    indicatorWidth = 100,
    containerWidth,
  } = props
  const { styles, theme } = useTheme()
  const { width: windowWidth } = useWindowDimensions()
  const style = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, headerHeight - headerCollapsedHeight],
      [headerHeight, headerCollapsedHeight],
      {
        extrapolateLeft: Extrapolation.CLAMP,
        extrapolateRight: Extrapolation.CLAMP,
      },
    )
    return {
      transform: [{ translateY }],
    }
  })

  const handleLayout = useCallback((e) => {
    setTabBarHeight(e.nativeEvent.layout.height)
  }, [])

  const indicatorStyle: ViewStyle = useMemo(() => {
    const style: ViewStyle = {
      backgroundColor: theme.colors.primary,
      height: 3,
      borderRadius: 3,
      // borderTopLeftRadius: 4,
      // borderTopRightRadius: 4,
    }
    if (indicatorWidth) {
      style.width = indicatorWidth
      style.marginHorizontal =
        ((containerWidth || windowWidth) / tabCount - indicatorWidth) / 2
    } else {
      style.width = 'auto'
      style.paddingHorizontal = 8
    }
    return style
  }, [theme, indicatorWidth, containerWidth, windowWidth, tabCount])

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
      ]}
    >
      <View onLayout={handleLayout}>
        <TabBar
          {...props}
          indicatorContainerStyle={[styles.layer1]}
          indicatorStyle={indicatorStyle}
          activeColor={theme.colors.primary}
          inactiveColor={theme.colors.text}
        />
      </View>
    </Animated.View>
  )
}
