import { View } from 'react-native'
import { WebView } from 'react-native-webview'
import React, { useLayoutEffect, useState } from 'react'
import { Pressable } from 'react-native'
import { ExternalLinkIcon } from 'react-native-heroicons/outline'
import { Linking } from 'react-native'
import { NProgress } from 'react-native-nprogress'

export default function BrowserScreen({ route, navigation }) {
  const [loading, setLoading] = useState(false)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (props) => (
        <Pressable
          className="h-[44px] w-[44px] items-center justify-center -mr-3 active:opacity-60"
          onPress={() => {
            Linking.openURL(route.params.url)
          }}>
          <ExternalLinkIcon size={24} color={props.tintColor} />
        </Pressable>
      )
    })
  }, [])
  return (
    <View style={{ flex: 1 }}>
      <WebView
        style={{ flex: 1 }}
        source={{ uri: route.params.url }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
      <View className="absolute w-full top-0">
        <NProgress backgroundColor="#111" height={3} enabled={loading} />
      </View>
    </View>
  )
}
