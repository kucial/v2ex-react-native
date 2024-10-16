import {
  createContext,
  ReactElement,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import {
  getStateFromPath,
  LinkingOptions,
  NavigationContainer,
  Route,
  useNavigationContainerRef,
} from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import * as Linking from 'expo-linking'

import { useTheme } from '../ThemeService'

const CurrentRoute = createContext(null)

const myGetStateFromPath = (path, options) => {
  // cleanup hash
  const state = getStateFromPath(path.replace(/#.*$/, ''), options)
  return state
}
const linking: LinkingOptions<AppStackParamList> = {
  prefixes: [
    Linking.createURL('/v2ex.com'),
    Linking.createURL('/*.v2ex.com'),
    'https://*.v2ex.com',
  ],
  config: {
    initialRouteName: 'main',
    screens: {
      topic: {
        path: 't/:id',
      },
      node: 'go/:name',
      member: 'member/:username',
    },
  },
  getStateFromPath: myGetStateFromPath,
}

export default function WrappedNavigationContainer(props: {
  children: ReactElement
}) {
  const { theme } = useTheme()
  const navigationRef = useNavigationContainerRef<NavigationParamList>()
  const [currentRoute, setCurrentRoute] = useState(null)
  const routeRef = useRef<Route<string>>()

  const onReady = useCallback(() => {
    routeRef.current = navigationRef.getCurrentRoute()
    setCurrentRoute(routeRef.current)
  }, [])

  const onStateChange = useCallback(() => {
    const previousRoute = routeRef.current
    const currentRoute = navigationRef.getCurrentRoute()
    if (previousRoute.key !== currentRoute.key) {
      const info = {
        prev: previousRoute,
        current: currentRoute,
      }
      Sentry.addBreadcrumb({
        level: 'info',
        category: 'navigation',
        message: `[${previousRoute.name}] ==> [${currentRoute.name}]`,
        data: info,
      })
    }
    routeRef.current = currentRoute
    setCurrentRoute(routeRef.current)
  }, [])

  return (
    <NavigationContainer<NavigationParamList>
      ref={navigationRef}
      theme={theme}
      linking={linking}
      onReady={onReady}
      onStateChange={onStateChange}>
      <CurrentRoute.Provider value={currentRoute}>
        {props.children}
      </CurrentRoute.Provider>
    </NavigationContainer>
  )
}

export const useCurrentRoute = () => useContext(CurrentRoute)
