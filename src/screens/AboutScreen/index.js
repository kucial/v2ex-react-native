import { View, Text, Pressable, SafeAreaView } from 'react-native'
import React from 'react'
import Constants from 'expo-constants'

import RNRestart from 'react-native-restart'
import storage from '@/utils/storage'

export default function AboutScreen() {
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 px-4 py-4 items-center justify-center">
        <View>
          <View className="mb-2">
            <Text className="text-2xl font-bold text-center">\V/2EX</Text>
          </View>
          <View className="my-2">
            <Text className="text-base text-center">
              又一个 V2EX 第三方客户端
            </Text>
          </View>
          <View className="mt-1 ">
            <Text className="text-sm text-gray-600 text-center">
              版本: {Constants.manifest.extra.revisionId}
            </Text>
          </View>
        </View>
      </View>

      <View className="px-4 py-4">
        <Pressable
          style={({ pressed }) => ({
            height: 50,
            backgroundColor: '#121222',
            borderRadius: 12,
            opacity: pressed ? 0.6 : 1,
            alignItems: 'center',
            justifyContent: 'center'
          })}
          onPress={() => {
            storage.clearAll()
            RNRestart.Restart()
          }}>
          <Text style={{ color: 'white' }}>重置APP</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
