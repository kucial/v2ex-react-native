import { Platform } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import colors from 'tailwindcss/colors'

import { headerLeft } from '@/components/BackButton'
import { useTheme } from '@/containers/ThemeService'

import AboutScreen from './AboutScreen'
import BrowserScreen from './BrowserScreen'
import MainTab from './MainTab'
import MemberScreen from './MemberScreen'
import {
  CollectedTopicsScreen,
  CreatedTopicsScreen,
  MyScreen,
  NotificationScreen,
  ProfileScreen,
  RepliedTopicsScreen,
  ViewedTopicsScreen,
} from './MyScreen'
import NewTopicScreen from './NewTopicScreen'
import NodeScreen from './NodeScreen'
import SearchScreen from './SearchScreen'
import {
  HomeTabs,
  ImgurSettings,
  PreferenceSettings,
  SettingsLanding,
} from './SettingsScreen'
import SigninScreen from './SigninScreen'
import TopicScreen from './TopicScreen'

const Stack = createNativeStackNavigator()

function AppStack() {
  const { theme, styles } = useTheme()
  const tintColor = theme.colors.primary

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: styles.layer1,
        headerBackTitleVisible: false,
        headerLeft,
        headerTintColor: tintColor,
        headerTitleStyle: styles.text,
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
            title: '话题',
          }}
        />
        <Stack.Screen
          name="node"
          component={NodeScreen}
          options={{
            title: '节点',
          }}
        />
        <Stack.Screen
          name="browser"
          component={BrowserScreen}
          options={{
            title: '内嵌网页',
          }}
        />
        <Stack.Screen
          name="member"
          component={MemberScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="about"
          component={AboutScreen}
          options={{
            title: '关于',
          }}
        />
        <Stack.Screen
          name="new-topic"
          component={NewTopicScreen}
          options={{
            title: '新主题',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Group>
      <Stack.Group>
        <Stack.Screen
          name="notification"
          component={NotificationScreen}
          options={{
            title: '消息',
          }}
        />
        <Stack.Screen
          name="profile"
          component={ProfileScreen}
          options={{
            title: '用户档案',
          }}
        />
        <Stack.Screen
          name="created-topics"
          component={CreatedTopicsScreen}
          options={{
            title: '创建的主题',
          }}
        />
        <Stack.Screen
          name="collected-topics"
          component={CollectedTopicsScreen}
          options={{
            title: '收藏的主题',
          }}
        />
        <Stack.Screen
          name="replied-topics"
          component={RepliedTopicsScreen}
          options={{
            title: '回复的主题',
          }}
        />
        <Stack.Screen
          name="viewed-topics"
          component={ViewedTopicsScreen}
          options={{
            title: '浏览的主题',
          }}
        />
      </Stack.Group>

      <Stack.Group>
        <Stack.Screen
          name="settings"
          component={SettingsLanding}
          options={{
            title: '设置',
          }}
        />
        <Stack.Screen
          name="imgur-settings"
          component={ImgurSettings}
          options={{
            title: 'Imgur 设置',
          }}
        />
        <Stack.Screen
          name="home-tab-settings"
          component={HomeTabs}
          options={{
            title: '首页标签设置',
          }}
        />
        <Stack.Screen
          name="preference-settings"
          component={PreferenceSettings}
          options={{
            title: '偏好设置',
          }}
        />
      </Stack.Group>

      <Stack.Screen
        name="signin"
        component={SigninScreen}
        options={{
          headerShown: false,
          presentation: Platform.OS === 'ios' ? 'modal' : undefined,
        }}
      />
    </Stack.Navigator>
  )
}

export default AppStack
