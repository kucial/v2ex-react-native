import { useRef } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import {
  HomeIcon,
  RectangleStackIcon,
  UserIcon
} from 'react-native-heroicons/outline'
import { SENTRY_DSN } from '@env'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
  NavigationContainer,
  useNavigationContainerRef
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import * as Sentry from 'sentry-expo'
import { SWRConfig } from 'swr'
import { TailwindProvider, useTailwind } from 'tailwindcss-react-native'

import { headerLeft } from './src/components/BackButton'
import ErrorBoundary from './src/components/ErrorBoundary'
import MainScreenHeader from './src/components/MainScreenHeader'
import ActivityIndicator from './src/containers/ActivityIndicator'
import AlertService from './src/containers/AlertService'
import AppSettingsService from './src/containers/AppSettingsService'
import AuthService from './src/containers/AuthService'
import ImgurService from './src/containers/ImgurService'
import ViewedTopicsService from './src/containers/ViewedTopicsService'
import WatchSchemeUpdate from './src/containers/WatchSchemeUpdate'
import { useColorScheme } from './src/hooks'
import AboutScreen from './src/screens/AboutScreen'
import BrowserScreen from './src/screens/BrowserScreen'
import DebugScreen from './src/screens/DebugScreen'
import HomeScreen from './src/screens/HomeScreen'
import MemberScreen from './src/screens/MemberScreen'
import {
  CollectedTopicsScreen,
  CreatedTopicsScreen,
  MyScreen,
  NotificationScreen,
  ProfileScreen,
  RepliedTopicsScreen,
  ViewedTopicsScreen
} from './src/screens/MyScreen'
import NewTopicScreen from './src/screens/NewTopicScreen'
import NodeScreen from './src/screens/NodeScreen'
import NodesScreen from './src/screens/NodesScreen'
import SearchScreen from './src/screens/SearchScreen'
import {
  HomeTabs,
  ImgurSettings,
  PreferenceSettings,
  SettingsLanding
} from './src/screens/SettingsScreen'
import SigninScreen from './src/screens/SigninScreen'
import TopicScreen from './src/screens/TopicScreen'
import fetcher, { FetcherWebView } from './src/utils/fetcher'
import { cacheProvider } from './src/utils/swr'
import * as themes from './theme'

Sentry.init({
  dsn: SENTRY_DSN,
  enableInExpoDevelopment: false,
  debug: false,
  tracesSampleRate: 1.0
})

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function MainTab() {
  const tw = useTailwind()
  const { color: inactiveColor } = tw('text-neutral-500 dark:text-neutral-500')

  return (
    <Tab.Navigator
      initialRouteName="feed"
      backBehavior="initialRoute"
      screenOptions={{
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: tw('dark:bg-neutral-800')
        // headerShown: false,
      }}>
      <Tab.Screen
        name="nodes"
        component={NodesScreen}
        options={{
          tabBarIcon: RectangleStackIcon,
          tabBarLabel: '节点',
          header: (props) => <MainScreenHeader {...props} />
        }}
      />
      <Tab.Screen
        name="feed"
        component={HomeScreen}
        options={{
          tabBarIcon: HomeIcon,
          tabBarLabel: '主题',
          header: (props) => <MainScreenHeader {...props} />
        }}
      />
      <Tab.Screen
        name="my"
        component={MyScreen}
        options={{
          tabBarIcon: UserIcon,
          tabBarLabel: '我的',
          header: (props) => <MainScreenHeader {...props} title={'我的'} />
        }}
      />
    </Tab.Navigator>
  )
}

function AppStack() {
  const tw = useTailwind()
  const { color: tintColor } = tw('color-neutral-900 dark:text-neutral-300')

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: tw('bg-white dark:bg-neutral-900'),
        headerBackTitleVisible: false,
        headerLeft,
        headerTintColor: tintColor,
        headerTitleStyle: tw('text-neutral-800 dark:text-neutral-300')
      }}>
      <Stack.Group>
        <Stack.Screen
          name="main"
          component={MainTab}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="search"
          component={SearchScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="topic"
          component={TopicScreen}
          options={{
            title: '话题'
          }}
        />
        <Stack.Screen
          name="node"
          component={NodeScreen}
          options={{
            title: '节点'
          }}
        />
        <Stack.Screen
          name="browser"
          component={BrowserScreen}
          options={{
            title: '内嵌网页'
          }}
        />
        <Stack.Screen
          name="member"
          component={MemberScreen}
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="about"
          component={AboutScreen}
          options={{
            title: '关于'
          }}
        />
        <Stack.Screen
          name="new-topic"
          component={NewTopicScreen}
          options={{
            title: '新主题',
            animation: 'slide_from_bottom'
          }}
        />
      </Stack.Group>
      <Stack.Group>
        <Stack.Screen
          name="notification"
          component={NotificationScreen}
          options={{
            title: '消息'
          }}
        />
        <Stack.Screen
          name="profile"
          component={ProfileScreen}
          options={{
            title: '用户档案'
          }}
        />
        <Stack.Screen
          name="created-topics"
          component={CreatedTopicsScreen}
          options={{
            title: '创建的主题'
          }}
        />
        <Stack.Screen
          name="collected-topics"
          component={CollectedTopicsScreen}
          options={{
            title: '收藏的主题'
          }}
        />
        <Stack.Screen
          name="replied-topics"
          component={RepliedTopicsScreen}
          options={{
            title: '回复的主题'
          }}
        />
        <Stack.Screen
          name="viewed-topics"
          component={ViewedTopicsScreen}
          options={{
            title: '浏览的主题'
          }}
        />
      </Stack.Group>

      <Stack.Group>
        <Stack.Screen
          name="settings"
          component={SettingsLanding}
          options={{
            title: '设置'
          }}
        />
        <Stack.Screen
          name="imgur-settings"
          component={ImgurSettings}
          options={{
            title: 'Imgur 设置'
          }}
        />
        <Stack.Screen
          name="home-tab-settings"
          component={HomeTabs}
          options={{
            title: '首页标签设置'
          }}
        />
        <Stack.Screen
          name="preference-settings"
          component={PreferenceSettings}
          options={{
            title: '偏好设置'
          }}
        />
      </Stack.Group>

      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name="signin"
          component={SigninScreen}
          options={{
            headerShown: false
          }}
        />
        {/* <Stack.Screen
          name="signup"
          component={SignupScreen}
          options={{
            headerShown: false
          }}
        /> */}
      </Stack.Group>
    </Stack.Navigator>
  )
}

const swrConfig = {
  fetcher: fetcher,
  provider: cacheProvider,
  onError(err, key, config) {
    if (err instanceof Error) {
      // err with custom code consider handled
      if (!err.code) {
        Sentry.Native.captureException(err, {
          extra: {
            key,
            config,
            info: err.data
          }
        })
      }
    } else {
      Sentry.Native.addBreadcrumb({
        type: 'info',
        data: { swrKey: key, err, message: err?.message }
      })
      Sentry.Native.captureMessage('SWR_ERROR_@')
    }
  }
  // isOnline() {
  //   return true
  // },
  // isVisible() {
  //   return true
  // },
  // initFocus(callback) {
  //   let appState = AppState.currentState

  //   const onAppStateChange = (nextAppState) => {
  //     /* If it's resuming from background or inactive mode to active one */
  //     if (appState.match(/inactive|background/) && nextAppState === 'active') {
  //       callback()
  //     }
  //     appState = nextAppState
  //   }

  //   // Subscribe to the app state change events
  //   const subscription = AppState.addEventListener('change', onAppStateChange)

  //   return () => {
  //     subscription.remove()
  //   }
  // },
  // initReconnect(callback) {
  //   let netState
  //   NetInfo.fetch().then((state) => {
  //     if (state.isConnected) {
  //       callback()
  //     }
  //     netState = state
  //   })
  //   const onNetworkChange = NetInfo.addEventListener((nextNetState) => {
  //     if (!netState?.isConnected && nextNetState.isConnected) {
  //       callback()
  //     }
  //     netState = nextNetState
  //   })

  //   const unsubscribe = NetInfo.addEventListener(onNetworkChange)

  //   return () => {
  //     unsubscribe()
  //   }
  // }
  // refreshInterval: 5 * 60 * 1000 // 5min
}

function App() {
  const scheme = useColorScheme()
  const navigationRef = useNavigationContainerRef()
  const routeRef = useRef()

  return (
    <AppSettingsService>
      <TailwindProvider initialColorScheme={scheme}>
        <WatchSchemeUpdate />
        <FetcherWebView />
        <ErrorBoundary>
          <GestureHandlerRootView style={{ flex: 1 }}>
            {/* <StatusBar style="auto" /> */}
            <SWRConfig value={swrConfig}>
              <AlertService>
                <ActionSheetProvider>
                  <ActivityIndicator>
                    <NavigationContainer
                      theme={themes[scheme]}
                      ref={navigationRef}
                      onReady={() => {
                        routeRef.current = navigationRef.getCurrentRoute()
                      }}
                      onStateChange={() => {
                        const previousRoute = routeRef.current
                        const currentRoute = navigationRef.getCurrentRoute()
                        if (previousRoute.key !== currentRoute.key) {
                          const info = {
                            prev: previousRoute,
                            current: currentRoute
                          }
                          Sentry.Native.addBreadcrumb({
                            level: 'info',
                            category: 'navigation',
                            data: info
                          })
                        }
                        routeRef.current = currentRoute
                      }}>
                      <ImgurService>
                        <BottomSheetModalProvider>
                          <AuthService>
                            <ViewedTopicsService>
                              {/* <DebugScreen /> */}
                              <AppStack />
                            </ViewedTopicsService>
                          </AuthService>
                        </BottomSheetModalProvider>
                      </ImgurService>
                    </NavigationContainer>
                  </ActivityIndicator>
                </ActionSheetProvider>
              </AlertService>
            </SWRConfig>
          </GestureHandlerRootView>
        </ErrorBoundary>
      </TailwindProvider>
    </AppSettingsService>
  )
}

export default App
