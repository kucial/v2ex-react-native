import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, View } from 'react-native'
import classNames from 'classnames'

import { APP_SIDEBAR_SIZE } from '@/constants'
import { useTheme } from '@/containers/ThemeService'
import { usePadLayout } from '@/utils/hooks'

import AppSidebar from '../AppSidebar'
import { AppLayoutContext } from './context'

const ANIMATE_DURATION = 300
const OFFSET_X = -60
const OFFSET_Y = OFFSET_X * -1

export default function Layout(props: { children: ReactNode }) {
  const { styles } = useTheme()
  const padLayout = usePadLayout()
  const [nav, setNav] = useState(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const translateXAnim = useRef(new Animated.Value(OFFSET_X)).current
  const translateYAnim = useRef(new Animated.Value(OFFSET_Y)).current

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
        Animated.timing(translateYAnim, {
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
            Animated.timing(translateYAnim, {
              toValue: OFFSET_Y,
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
      <View
        className={classNames(
          'flex-1 flex',
          padLayout.orientation === 'PORTRAIT'
            ? 'flex-col'
            : 'flex-row-reverse',
        )}>
        <View
          style={{
            flex: 1,
          }}>
          {props.children}
        </View>
        {padLayout.active && (
          <AppSidebar
            position={padLayout.orientation === 'PORTRAIT' ? 'BOTTOM' : 'SIDE'}
            dynamic={
              <Animated.View
                style={[
                  styles.layer2,
                  padLayout.orientation === 'PORTRAIT'
                    ? {
                        opacity: fadeAnim,
                        flexDirection: 'row',
                        borderRadius: 8,
                        transform: [
                          {
                            translateY: translateYAnim,
                          },
                        ],
                      }
                    : {
                        opacity: fadeAnim,
                        marginTop: 'auto',
                        borderRadius: 8,
                        alignItems: 'center',
                        marginLeft: 8,
                        marginRight: 8,
                        paddingTop: 1,
                        paddingBottom: 1,
                        transform: [{ translateX: translateXAnim }],
                      },
                ]}>
                {nav}
              </Animated.View>
            }
          />
        )}
      </View>
    </AppLayoutContext.Provider>
  )
}
