import { View, Text } from 'react-native'
import React, { useRef, useEffect } from 'react'
import { Pressable } from 'react-native'
import WebView from 'react-native-webview'
import useSWR from 'swr'
import { useAuthService } from '@/containers/AuthService'
import CookieManager from '@react-native-cookies/cookies'
import Loader from '@/components/Loader'
export default function DebugScreen() {
  const authService = useAuthService()
  useEffect(() => {
    CookieManager.get('http://www.v2ex.com').then((cookies) => {
      console.log('cookies....', cookies)
    })
  }, [])

  return (
    <View className="flex-1 justify-center items-center">
      <View className="bg-gray-50">
        <Loader />
      </View>
    </View>
  )
}
