import { TailwindProvider } from 'tailwindcss-react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SWRConfig } from 'swr'

import {
  CollectionIcon,
  HomeIcon,
  UserIcon
} from 'react-native-heroicons/outline'

import MainScreenHeader from './src/components/MainScreenHeader'

import AuthServiceProvider from './src/containers/AuthServiceProvider'
import AlertService from './src/containers/AlertService'

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

import DebugScreen from './src/screens/DebugScreen'

import fetcher, { FetcherWebView } from './src/utils/fetcher'
import cache from './src/utils/cache'

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
          tabBarIcon: CollectionIcon,
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
        headerBackTitleVisible: false
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
        <Stack.Screen name="node" component={NodeScreen} />
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
  refreshInterval: 5 * 60 * 1000 // 5min
}

export default function App() {
  return (
    <>
      <FetcherWebView />
      <SWRConfig value={swrConfig}>
        <TailwindProvider>
          <AlertService>
            <NavigationContainer>
              <AuthServiceProvider>
                {/* <DebugScreen /> */}
                <AppStack />
              </AuthServiceProvider>
            </NavigationContainer>
          </AlertService>
        </TailwindProvider>
      </SWRConfig>
    </>
  )
}
