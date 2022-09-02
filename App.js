import * as Sentry from '@sentry/react-native'
import { AppState } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import { TailwindProvider } from 'tailwindcss-react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SWRConfig } from 'swr'
import { SENTRY_DSN } from '@env'

import { FolderIcon, HomeIcon, UserIcon } from 'react-native-heroicons/outline'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'

import { headerLeft } from './src/components/BackButton'

import MainScreenHeader from './src/components/MainScreenHeader'
import ErrorBoundary from './src/components/ErrorBoundary'

import AuthService from './src/containers/AuthService'
import AlertService from './src/containers/AlertService'
import ActivityIndicator from './src/containers/ActivityIndicator'

import HomeScreen from './src/screens/HomeScreen'
import NodesScreen from './src/screens/NodesScreen'
import MyScreen from './src/screens/MyScreen'
import SearchScreen from './src/screens/SearchScreen'
import TopicScreen from './src/screens/TopicScreen'
import NodeScreen from './src/screens/NodeScreen'
import BrowserScreen from './src/screens/BrowserScreen'
import MemberScreen from './src/screens/MemberScreen'
import SigninScreen from './src/screens/SigninScreen'
import NotificationScreen from './src/screens/NotificationScreen'
import CollectedTopicsScreen from './src/screens/CollectedTopicsScreen'
import SettingsScreen from './src/screens/SettingsScreen'
import AboutScreen from './src/screens/AboutScreen'

import DebugScreen from './src/screens/DebugScreen'

import fetcher, { FetcherWebView } from './src/utils/fetcher'
import cache from './src/utils/cache'

Sentry.init({
  dsn: SENTRY_DSN,
  enableInExpoDevelopment: false,
  debug: false,
  tracesSampleRate: 1.0
})

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function MainTab() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#111'
        // headerShown: false,
      }}>
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
        name="nodes"
        component={NodesScreen}
        options={{
          tabBarIcon: FolderIcon,
          tabBarLabel: '节点',
          header: (props) => <MainScreenHeader {...props} />
        }}
      />
      <Tab.Screen
        name="my"
        component={MyScreen}
        options={{
          tabBarIcon: UserIcon,
          tabBarLabel: '我的'
        }}
      />
    </Tab.Navigator>
  )
}

function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: '#111',
        headerBackTitleVisible: false,
        headerLeft
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
          name="notification"
          component={NotificationScreen}
          options={{
            title: '消息'
          }}
        />
        <Stack.Screen
          name="collected-topics"
          component={CollectedTopicsScreen}
          options={{
            title: '我收藏的内容'
          }}
        />
        <Stack.Screen
          name="settings"
          component={SettingsScreen}
          options={{
            title: '设置'
          }}
        />
        <Stack.Screen
          name="about"
          component={AboutScreen}
          options={{
            title: '关于'
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
  provider: cache,
  onError(err, key, config) {
    if (err instanceof Error) {
      Sentry.captureException(err, {
        extra: {
          key,
          config
        }
      })
    } else {
      Sentry.captureMessage('SWR_EROR', {
        err,
        key,
        config
      })
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
  return (
    <ErrorBoundary>
      <FetcherWebView />
      <SWRConfig value={swrConfig}>
        <TailwindProvider>
          <AlertService>
            <ActionSheetProvider>
              <ActivityIndicator>
                <NavigationContainer>
                  <AuthService>
                    {/* <DebugScreen /> */}
                    <AppStack />
                  </AuthService>
                </NavigationContainer>
              </ActivityIndicator>
            </ActionSheetProvider>
          </AlertService>
        </TailwindProvider>
      </SWRConfig>
    </ErrorBoundary>
  )
}

export default Sentry.wrap(App)
