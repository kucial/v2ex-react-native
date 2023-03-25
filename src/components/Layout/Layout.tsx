import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, View } from 'react-native'

import { APP_SIDEBAR_WIDTH } from '@/constants'
import { useTheme } from '@/containers/ThemeService'
import { usePadLayout } from '@/utils/hooks'

import AppSidebar from '../AppSidebar'
import { AppLayoutContext } from './context'

const ANIMATE_DURATION = 300
const OFFSET_X = -60

export default function Layout(props: { children: ReactNode }) {
  const { styles } = useTheme()
  const padLayout = usePadLayout()
  const [nav, setNav] = useState(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateXAnim = useRef(new Animated.Value(OFFSET_X)).current

  useEffect(() => {
    if (!!nav) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(translateXAnim, {
          toValue: 0,
          duration: ANIMATE_DURATION,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [nav])

  const context = useMemo(() => {
    let hasData = false
    return {
      setPageNav(data) {
        if (!data) {
          hasData = false
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: ANIMATE_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(translateXAnim, {
              toValue: OFFSET_X,
              duration: ANIMATE_DURATION,
              useNativeDriver: true,
            }),
          ]).start(() => {
            if (!hasData) {
              setNav(null)
            }
          })
        } else {
          hasData = true
          setNav(data)
        }
      },
    }
  }, [])

  return (
    <AppLayoutContext.Provider value={context}>
      <View className="flex-1 flex flex-row">
        {padLayout && (
          <View style={[{ width: APP_SIDEBAR_WIDTH }, styles.layer1]}>
            <AppSidebar
              dynamic={
                <Animated.View
                  style={{
                    opacity: fadeAnim,
                    marginTop: 'auto',
                    paddingBottom: 8,
                    alignItems: 'center',
                    transform: [{ translateX: translateXAnim }],
                  }}>
                  {nav}
                </Animated.View>
              }
            />
          </View>
        )}
        <View
          style={{
            flex: 1,
          }}>
          {props.children}
        </View>
      </View>
    </AppLayoutContext.Provider>
  )
}
