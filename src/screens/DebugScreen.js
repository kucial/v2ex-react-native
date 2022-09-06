import { View, Text, SafeAreaView, Keyboard } from 'react-native'
import React, { useRef, useEffect } from 'react'
import { Pressable } from 'react-native'
import WebView from 'react-native-webview'
import useSWR from 'swr'
import { useAuthService } from '@/containers/AuthService'
import CookieManager from '@react-native-cookies/cookies'
import Loader from '@/components/Loader'
import { useNavigation } from '@react-navigation/native'
import {
  EditorProvider,
  EditorRender,
  EditorToolbar,
  EditorDismiss
} from '@/components/SlateEditor'
import KeyboardAwareView from '@/components/KeyboardAwareView'

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
    <View className="flex-1">
      <KeyboardAwareView animated={false}>
        <SafeAreaView>
          <EditorProvider>
            <EditorDismiss className="flex-1 h-full">
              <View className="p-2 bg-blue-200">
                <EditorRender placeholder="输入内容" />
              </View>
              <View className="absolute bottom-0 left-0 width-full">
                <EditorToolbar showOnFocus />
              </View>
            </EditorDismiss>
          </EditorProvider>
        </SafeAreaView>
      </KeyboardAwareView>
    </View>
  )
}
