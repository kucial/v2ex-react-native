import { View, Text, Pressable, Linking } from 'react-native'
import React, { useLayoutEffect } from 'react'

export default function BrowserScreen({ route, navigation }) {
  const { url } = route.params
  useLayoutEffect(() => {
    navigation.setOptions({
      title: '外部链接'
    })
  }, [])
  return (
    <View className="items-center flex-1 justify-center">
      <View className="bg-white p-4 rounded">
        <View className="mb-2">
          <Text className="text-base font-medium">访问外部链接：</Text>
        </View>
        <View className="max-w-[300px] mb-3">
          <Text>{url}</Text>
        </View>
        <Pressable
          className="h-[44px] rounded-md bg-gray-800 px-3 items-center justify-center active:opacity-60"
          onPress={() => {
            Linking.openURL(url)
          }}>
          <Text className="text-white">继续前往</Text>
        </Pressable>
      </View>
    </View>
  )
}
