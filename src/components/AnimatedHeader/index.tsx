import React, { ReactElement } from 'react'
import { Platform, Text, View } from 'react-native'
import Animate, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { useNavigation } from '@react-navigation/native'
import Constants from 'expo-constants'

import BackButton from '@/components/BackButton'
import { useTheme } from '@/containers/ThemeService'

function AnimatedHeader(props: {
  title?: string
  scrollY: SharedValue<number>
  hasBorder?: boolean
  headerRight?: ReactElement
  animatedTitle?: boolean
}) {
  const { styles } = useTheme()
  const { scrollY } = props
  const navigation = useNavigation()

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
      className="w-full flex-row items-center pl-4"
      style={[
        {
          height:
            Platform.OS === 'android' ? 48 : 48 + Constants.statusBarHeight,
          paddingTop: Platform.OS === 'android' ? 0 : Constants.statusBarHeight,
          backgroundColor: styles.layer1.backgroundColor,
        },
        props.hasBorder && styles.border_b_light,
      ]}>
      <View
        style={{
          position: 'absolute',
          left: 6,
          top: Platform.OS === 'android' ? 4 : Constants.statusBarHeight,
          zIndex: 10,
        }}>
        <BackButton
          tintColor={styles.text.color}
          onPress={() => {
            navigation.goBack()
          }}
        />
      </View>
      <Animate.View
        style={[
          {
            position: 'absolute',
            left: 55,
            right: 55,
            height: 48,
            bottom: 0,
            justifyContent: 'center',
          },
          titleStyles,
        ]}>
        <Text
          style={[
            styles.text,
            { textAlign: 'center', fontSize: 17, fontWeight: '500' },
          ]}
          ellipsizeMode="tail"
          numberOfLines={1}>
          {props.title}
        </Text>
      </Animate.View>
      {props.headerRight && (
        <View
          style={{
            position: 'absolute',
            right: 6,
            top: Platform.OS === 'android' ? 4 : Constants.statusBarHeight,
            zIndex: 10,
          }}>
          {props.headerRight}
        </View>
      )}
    </View>
  )
}

export default AnimatedHeader
