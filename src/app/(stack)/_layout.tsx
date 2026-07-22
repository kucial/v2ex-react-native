import { Platform, View } from 'react-native'
import { Stack } from 'expo-router'

import { usePadLayout } from '@/containers/AppSettingsService'

const transparentHeaderBackground = () => (
  <View
    style={{
      height: '100%',
      backgroundColor: 'transparent',
    }}
    pointerEvents='none'
  />
)

export default function StackLayout() {
  const { active } = usePadLayout()

  return (
    <Stack
      screenOptions={{
        fullScreenGestureEnabled: true,
        headerShown: false,
      }}
      initialRouteName='(tabs)'
    >
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen
        name='search'
        options={{
          headerShown: false,
          headerTransparent: true,
          headerBackground: transparentHeaderBackground,
          animation: 'none',
        }}
      />
      <Stack.Screen
        name='topic/[id]'
        options={{
          headerShown: false,
          headerTransparent: true,
          headerBackground: transparentHeaderBackground,
        }}
      />
      <Stack.Screen
        name='node/[name]'
        options={{
          headerShown: false,
          headerTransparent: true,
          headerBackground: transparentHeaderBackground,
        }}
      />
      <Stack.Screen
        name='browser'
        options={{
          title: '内嵌网页',
        }}
      />
      <Stack.Screen
        name='member/[username]'
        options={{
          headerShown: false,
          headerTransparent: true,
          headerBackground: transparentHeaderBackground,
        }}
      />
      <Stack.Screen
        name='me/info'
        options={{
          title: '用户信息',
        }}
      />
      <Stack.Screen
        name='about'
        options={{
          title: '关于',
        }}
      />
      <Stack.Screen
        name='new-topic'
        options={{
          title: '新主题',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name='topic/[id]/edit'
        options={{
          title: '编辑主题',
        }}
      />
      <Stack.Screen
        name='me/index'
        options={{
          title: '用户档案',
        }}
      />
      <Stack.Screen
        name='me/balance'
        options={{
          title: '账户余额',
        }}
      />
      <Stack.Screen
        name='me/created-topics'
        options={{
          title: '创建的主题',
        }}
      />
      <Stack.Screen
        name='me/collected-topics'
        options={{
          title: '收藏的主题',
        }}
      />
      <Stack.Screen
        name='me/replied-topics'
        options={{
          title: '回复的主题',
        }}
      />
      <Stack.Screen name='me/viewed-topics' />
      <Stack.Screen
        name='me/notification'
        options={{
          title: '消息',
        }}
      />
      <Stack.Screen
        name='imgur-settings'
        options={{
          title: 'Imgur 设置',
        }}
      />
      <Stack.Screen
        name='imgur-oauth'
        options={{
          animation: 'none',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='home-tab-settings'
        options={{
          title: '首页标签设置',
        }}
      />
      <Stack.Screen
        name='preference-settings'
        options={{
          title: '功能设置',
        }}
      />
      <Stack.Screen
        name='theme-settings'
        options={{
          title: '主题样式',
        }}
      />
      <Stack.Screen
        name='signin'
        options={{
          headerShown: false,
          headerTransparent: true,
          headerBackground: transparentHeaderBackground,
          presentation: Platform.OS === 'ios' ? 'modal' : undefined,
        }}
      />
      <Stack.Screen
        name='feedback'
        options={{
          title: '意见反馈',
        }}
      />
      <Stack.Screen
        name='my'
        options={{
          title: '我的',
        }}
      />
    </Stack>
  )
}
