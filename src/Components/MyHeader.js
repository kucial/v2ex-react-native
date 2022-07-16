import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native'
import { SearchIcon } from 'react-native-heroicons/outline'
import Constants from 'expo-constants'
import React from 'react'

export default function Header({ navigation }) {
  return (
    <View
      className="bg-white w-full flex-row items-center px-4 border-b border-solid border-b-gray-100"
      style={{
        height: 48 + Constants.statusBarHeight,
        paddingTop: Constants.statusBarHeight
      }}>
      <View className="flex-1">
        <Text className="text-lg font-bold">V2EX</Text>
      </View>

      <View className="flex flex-row space-x-3 items-center justify-self-end">
        <TouchableOpacity
          className="w-[44px] h-[44px] flex items-center justify-center active:bg-gray-100 rounded-full"
          onPress={() => {
            navigation.navigate('search')
          }}>
          <SearchIcon size={24} color={'#333'} />
        </TouchableOpacity>
      </View>
    </View>
  )
}
