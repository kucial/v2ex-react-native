import {
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from 'react-native'
import FastImage from 'react-native-fast-image'
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
      <View className="flex-1 px-4 pb-8 items-center justify-center">
        <View className="bg-white dark:bg-neutral-900 w-full py-3 rounded-lg">
          <View className="my-2">
            <Text className="text-2xl font-bold text-center dark:text-neutral-200">
              R2V
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
        <View className="py-2 w-full flex flex-row">
          <View className="basis-1/2 pr-2">
            <Pressable
              className={classNames(
                'h-[50px] rounded-md flex items-center justify-center mt-4',
                'bg-white active:opacity-60',
                'dark:bg-neutral-900 dark:opacity-90 dark:active:opacity-60',
              )}
              onPress={() => {
                // clear swr cache
                const keys = storage.getAllKeys()
                keys.forEach((key) => {
                  if (/\$app\$/.test(key)) {
                    return
                  }
                  storage.delete(key)
                })
                FastImage.clearDiskCache()
                RNRestart.Restart()
              }}>
              <Text className="text-neutral-800 dark:text-neutral-300">
                清除缓存
              </Text>
            </Pressable>
          </View>
          <View className="basis-1/2 pl-2">
            <Pressable
              className={classNames(
                'h-[50px] rounded-md flex items-center justify-center mt-4',
                'bg-white active:opacity-60',
                'dark:bg-neutral-900 dark:opacity-90 dark:active:opacity-60',
              )}
              onPress={() => {
                storage.clearAll()
                FastImage.clearDiskCache()
                RNRestart.Restart()
              }}>
              <Text className="text-red-500 dark:text-rose-500">重置</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}
