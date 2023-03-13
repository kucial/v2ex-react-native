import {
  createContext,
  ReactElement,
  useContext,
  useRef,
  useState,
} from 'react'
import {
  NavigationContainer,
  Route,
  useNavigationContainerRef,
} from '@react-navigation/native'
import * as Sentry from 'sentry-expo'

import { useTheme } from '../ThemeService'

const CurrentRoute = createContext(null)

export default function WrappedNavigationContainer(props: {
  children: ReactElement
}) {
  const { theme } = useTheme()
  const navigationRef = useNavigationContainerRef()
  const [currentRoute, setCurrentRoute] = useState(null)
  const routeRef = useRef<Route<string>>()
  return (
    <NavigationContainer
      ref={navigationRef}
      theme={theme}
      onReady={() => {
        routeRef.current = navigationRef.getCurrentRoute()
        setCurrentRoute(routeRef.current)
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
        setCurrentRoute(routeRef.current)
      }}>
      <CurrentRoute.Provider value={currentRoute}>
        {props.children}
      </CurrentRoute.Provider>
    </NavigationContainer>
  )
}

export const useCurrentRoute = () => useContext(CurrentRoute)
