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
import ImgurPicker from '@/components/ImgurPicker'
import { useState } from 'react'
import SlideUp from '@/components/SlideUp'

export default function DebugScreen() {
  const [open, setOpen] = useState(true)

  return (
    <View className="flex-1">
      <ImgurPicker />
    </View>
  )
}
