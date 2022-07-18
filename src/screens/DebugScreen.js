import { View, Text } from 'react-native'
import React, { useRef } from 'react'
import { Pressable } from 'react-native'
import WebView from 'react-native-webview'
import useSWR from 'swr'

export default function DebugScreen() {
  const ref = useRef()
  const tabsSwr = useSWR('/page/index/tabs.json')

  return (
    <View>
      <Text>TODO</Text>
      {tabsSwr.data &&
        tabsSwr.data.map((item) => (
          <View key={item.value}>
            <Text>{item.label}</Text>
          </View>
        ))}
    </View>
  )
}
