import React from 'react'
import {
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  View
} from 'react-native'
import RNRestart from 'react-native-restart'
import classNames from 'classnames'
import Constants from 'expo-constants'
import colors from 'tailwindcss/colors'
import { useColorScheme } from 'tailwindcss-react-native'

import GithubIcon from '@/components/GithubIcon'
import storage from '@/utils/storage'

export default function AboutScreen() {
  const { colorScheme } = useColorScheme()
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 px-4 py-2 items-center justify-center">
        <View className="bg-white dark:bg-neutral-900 w-full py-3 rounded-lg">
          <View className="my-2">
            <Text className="text-2xl font-bold text-center dark:text-neutral-200">
              \V2EX/
            </Text>
          </View>
          <View className="my-2">
            <Text className="text-base text-center dark:text-neutral-200">
              V2EX 第三方客户端
            </Text>
          </View>
          <View>
            <Text className="text-center dark:text-neutral-200">
              {Constants.manifest.version}
              <Text className="ml-2">
                {Platform.OS === 'ios' && Constants.manifest.ios.buildNumber}
                {Platform.OS === 'android' &&
                  Constants.manifest.android.versionCode}
              </Text>
            </Text>
          </View>

          {Constants.manifest.extra.buildTime && (
            <View className="mt-2">
              <Text className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                构建时间: {Constants.manifest.extra.buildTime}
              </Text>
            </View>
          )}

          <View className="flex flex-row items-center justify-center mt-2">
            <Pressable
              className="p-2 flex flex-row items-center rounded-lg active:bg-neutral-100 active:opacity-60"
              onPress={() => {
                Linking.openURL('https://github.com/kucial/v2ex-react-native')
              }}>
              <GithubIcon
                color={
                  colorScheme === 'dark'
                    ? colors.neutral[300]
                    : colors.neutral[800]
                }
              />
              {/* <Text className="ml-1">issues</Text> */}
            </Pressable>
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
