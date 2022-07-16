import { View, Text } from 'react-native'
import React from 'react'
import Constants from 'expo-constants'
import BackButton from '@/Components/BackButton'

export default function SearchScreen({ navigation }) {
  return (
    <View
      className="bg-white w-full flex-row items-center px-2"
      style={{
        height: 48 + Constants.statusBarHeight,
        paddingTop: Constants.statusBarHeight
      }}>
      <View className="-ml-1">
        <BackButton
          onPress={() => {
            navigation.goBack()
          }}
        />
      </View>
      <Text>SearchScreen</Text>
    </View>
  )
}
