import { View, Text } from 'react-native'
import React, { useRef, useEffect } from 'react'
import { Pressable } from 'react-native'
import WebView from 'react-native-webview'
import useSWR from 'swr'
import { useAuthService } from '@/containers/AuthService'
import CookieManager from '@react-native-cookies/cookies'
import Loader from '@/components/Loader'
import { useNavigation } from '@react-navigation/native'
export default function DebugScreen() {
  const authService = useAuthService()
  const navigation = useNavigation()

  console.log(navigation)
  useEffect(() => {
    CookieManager.get('http://www.v2ex.com').then((cookies) => {
      console.log('cookies....', cookies)
    })
  }, [])

  return (
    <View className="flex-1 justify-center items-center">
      <View className="bg-gray-50">
        <Loader />
        <Pressable
          onPress={() => {
            navigation.navigate('member', {
              username: 'kongkx'
            })
          }}>
          <Text>Throw Error</Text>
        </Pressable>
      </View>
    </View>
  )
}
