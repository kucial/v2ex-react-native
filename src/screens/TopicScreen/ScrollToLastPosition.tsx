import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated,
  Pressable,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native'
import {
  runOnJS,
  SharedValue,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated'

import { useAlertService } from '@/containers/AlertService'
import { useAutoScrollToLastPosition } from '@/containers/AppSettingsService/hooks'
import { useTheme } from '@/containers/ThemeService'

const OFFSET_Y = 12
const ANIMATE_DURATION = 300

function ScrollToLastPosition(props: {
  onPress: (animated?: boolean) => void
  style?: StyleProp<ViewStyle>
  scrollY?: SharedValue<number>
}) {
  const autoScrollToLastPosition = useAutoScrollToLastPosition()
  const [visible, setVisible] = useState(!autoScrollToLastPosition)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateYAnim = useRef(new Animated.Value(OFFSET_Y)).current
  const { styles } = useTheme()
  const alert = useAlertService()
  const handled = useRef(false)
  const startY = useSharedValue(0)
  const isReady = useSharedValue(false)

  const onPressRef = useRef(props.onPress)
  onPressRef.current = props.onPress

  const hideButton = useCallback(() => {
    if (!handled.current) {
      handled.current = true
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: ANIMATE_DURATION,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false)
      })
    }
  }, [fadeAnim])

  useAnimatedReaction(
    () => props.scrollY?.value ?? 0,
    (val) => {
      if (isReady.value && Math.abs(val - startY.value) > 20) {
        isReady.value = false
        runOnJS(hideButton)()
      }
    },
  )

  useEffect(() => {
    if (props.scrollY) {
      startY.value = props.scrollY.value
      const id = setTimeout(() => {
        isReady.value = true
      }, 500)
      return () => clearTimeout(id)
    }
  }, [props.scrollY, startY, isReady])

  useEffect(() => {
    if (autoScrollToLastPosition && !handled.current) {
      const id = setTimeout(() => {
        onPressRef.current(false)
        handled.current = true
        alert.show({
          type: 'success',
          message: '已自动滚动到上次浏览位置',
        })
      }, 400)
      return () => clearTimeout(id)
    }
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
    ]).start()
  }, [fadeAnim, translateYAnim, autoScrollToLastPosition, alert])

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
        ]}
      >
        <Pressable
          onPress={() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: ANIMATE_DURATION,
              useNativeDriver: true,
            }).start(() => {
              handled.current = true
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
          ]}
        >
          <Text
            style={[
              styles.btn_primary__text,
              {
                fontSize: 14,
              },
            ]}
          >
            滚动到上次浏览的位置
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  )
}

export default ScrollToLastPosition
