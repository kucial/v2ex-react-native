import { useRef } from 'react'
import {
  NavigationContainer,
  useNavigationContainerRef,
  Route,
} from '@react-navigation/native'
import * as Sentry from 'sentry-expo'

import { useTheme } from '../ThemeService'

export default function WrappedNavigationContainer(props) {
  const { theme } = useTheme()
  const navigationRef = useNavigationContainerRef()
  const routeRef = useRef<Route<string>>()
  return (
    <NavigationContainer
      ref={navigationRef}
      theme={theme}
      onReady={() => {
        routeRef.current = navigationRef.getCurrentRoute()
      }}
      onStateChange={() => {
        const previousRoute = routeRef.current
        const currentRoute = navigationRef.getCurrentRoute()
        if (previousRoute.key !== currentRoute.key) {
          const info = {
            prev: previousRoute,
            current: currentRoute,
          }
          Sentry.Native.addBreadcrumb({
            level: 'info',
            category: 'navigation',
            message: `[${previousRoute.name}] ==> [${currentRoute.name}]`,
            data: info,
          })
        }
        routeRef.current = currentRoute
      }}>
      {props.children}
    </NavigationContainer>
  )
}