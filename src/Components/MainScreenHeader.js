import { Image, View, Pressable } from 'react-native'
import { SearchIcon } from 'react-native-heroicons/outline'
import Constants from 'expo-constants'
import React from 'react'
import logoImage from '@/assets/logo.png'

export default function HomeScreenHeader({ navigation }) {
  return (
    <View
      className="bg-white w-full flex-row items-center pl-4 border-b border-solid border-b-gray-100"
      style={{
        height: 48 + Constants.statusBarHeight,
        paddingTop: Constants.statusBarHeight
      }}>
      <View className="flex-1">
        <Image
          source={logoImage}
          style={{
            width: 47,
            height: 15
          }}
        />
        {/* <Text className="text-lg font-bold">V2EX</Text> */}
      </View>

      <View className="flex flex-row space-x-3 items-center justify-self-end pr-1">
        <Pressable
          className="w-[44px] h-[44px] flex items-center justify-center  rounded-full active:bg-gray-100 active:opacity-60"
          onPress={() => {
            navigation.push('search')
          }}>
          <SearchIcon size={24} color={'#333'} />
        </Pressable>
      </View>
    </View>
  )
}
