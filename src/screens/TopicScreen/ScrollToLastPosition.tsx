import { useEffect, useRef, useState } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
import { styled } from 'nativewind'

import { useTheme } from '@/containers/ThemeService'

const OFFSET_Y = 12
const ANIMATE_DURATION = 300

function ScrollToLastPosition(props) {
  const [visible, setVisible] = useState(true)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateYAnim = useRef(new Animated.Value(OFFSET_Y)).current
  const timer = useRef(null)
  const { styles } = useTheme()

  useEffect(() => {
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: ANIMATE_DURATION,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      timer.current = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: ANIMATE_DURATION,
          useNativeDriver: true,
        }).start(() => {
          setVisible(false)
        })
        timer.current = null
      }, 3000)
    })
    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, [])

  if (!visible) {
    return null
  }

  return (
    <View style={props.style}>
      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}>
        <Pressable
          onPress={() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: ANIMATE_DURATION,
              useNativeDriver: true,
            }).start(() => {
              setVisible(false)
            })
            props.onPress()
          }}
          style={[
            styles.btn_primary__bg,
            {
              opacity: 0.9,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 9999,
            },
          ]}>
          <Text
            style={[
              styles.btn_primary__text,
              {
                fontSize: 14,
              },
            ]}>
            滚动到上次浏览的位置
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  )
}

export default styled(ScrollToLastPosition)
