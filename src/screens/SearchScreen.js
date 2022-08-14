import {
  View,
  Text,
  InteractionManager,
  TextInput,
  Pressable
} from 'react-native'
import React, { useRef, useEffect } from 'react'
import Constants from 'expo-constants'
import BackButton from '@/components/BackButton'
import { useTailwind } from 'tailwindcss-react-native'

export default function SearchScreen({ navigation }) {
  const searchInput = useRef()
  const tw = useTailwind()
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      searchInput.current?.focus()
    })
  }, [])
  return (
    <View
      className="bg-white w-full flex-row items-center pl-1"
      style={{
        height: 48 + Constants.statusBarHeight,
        paddingTop: Constants.statusBarHeight
      }}>
      <View className="mr-1">
        <BackButton
          onPress={() => {
            navigation.goBack()
          }}
        />
      </View>
      <View className="flex flex-row flex-1 pr-3 items-center">
        <TextInput
          style={{
            ...tw('bg-gray-100 rounded-lg flex-1 py-2 px-2 text-base'),
            lineHeight: 20
          }}
          ref={searchInput}
          placeholder="输入关键词"
          returnKeyType="search"
          onSubmitEditing={({ nativeEvent }) => {
            console.log(nativeEvent.text)
          }}
        />
        <Pressable
          hitSlop={6}
          className="rounded px-3 py-2 ml-2 active:bg-gray-100 active:opacity-60">
          <Text className="text-gray-900 font-semibold tracking-wide text-base">
            搜索
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
