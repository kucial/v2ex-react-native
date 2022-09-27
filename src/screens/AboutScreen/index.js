import { View, Text, Pressable, SafeAreaView } from 'react-native'
import React from 'react'
import Constants from 'expo-constants'

import RNRestart from 'react-native-restart'
import storage from '@/utils/storage'
import classNames from 'classnames'

export default function AboutScreen() {
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 px-4 py-4 items-center justify-center">
        <View className="bg-white dark:bg-neutral-900 w-full py-8 rounded-lg">
          <View className="mb-2">
            <Text className="text-2xl font-bold text-center dark:text-neutral-200">
              \V2EX/
            </Text>
          </View>
          <View className="my-2">
            <Text className="text-base text-center dark:text-neutral-200">
              V2EX 第三方客户端
            </Text>
          </View>
          <View className="mt-1 ">
            <Text className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
              版本: {Constants.manifest.extra.buildId}
            </Text>
          </View>
        </View>
      </View>

      <View className="px-4 py-4">
        <Pressable
          className={classNames(
            'h-[50px] rounded-md flex items-center justify-center mt-4',
            'bg-neutral-900 active:opacity-60',
            'dark:bg-amber-50 dark:opacity-90 dark:active:opacity-60'
          )}
          onPress={() => {
            storage.clearAll()
            RNRestart.Restart()
          }}>
          <Text className="text-white dark:text-neutral-900">清除缓存</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
