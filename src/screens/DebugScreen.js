import { View, Text } from 'react-native'
import React, { useRef, useEffect } from 'react'
import { Pressable } from 'react-native'
import WebView from 'react-native-webview'
import useSWR from 'swr'
import { useAuthService } from '@/containers/AuthService'
import CookieManager from '@react-native-cookies/cookies'
export default function DebugScreen() {
  const ref = useRef()
  const tabsSwr = useSWR('/page/index/tabs.json')
  const authService = useAuthService()
  useEffect(() => {
    CookieManager.get('http://www.v2ex.com').then((cookies) => {
      console.log('cookies....', cookies)
    })
  }, [])

  return (
    <View className="flex-1">
      <WebView source={{ uri: 'https://v2ex.com' }}></WebView>
      {authService?.user && (
        <View>
          <Text>{authService.user.username}</Text>
        </View>
      )}

      <Pressable
        className="flex flex-row items-center justify-center active:opacity-60 active:bg-red-100 h-[44px] rounded"
        onPress={() => {
          authService.logout().catch((err) => {
            console.log(err)
          })
        }}>
        <Text className="text-red-700">退出登录</Text>
      </Pressable>
    </View>
  )
}
