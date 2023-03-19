import { useEffect, useState } from 'react'
import {
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from 'react-native'
import { ArrowUpOnSquareIcon } from 'react-native-heroicons/outline'
import RNRestart from 'react-native-restart'
import CookieManager from '@react-native-cookies/cookies'
import classNames from 'classnames'
import Constants from 'expo-constants'
import { Image } from 'expo-image'

import GithubIcon from '@/components/GithubIcon'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useAlertService } from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import storage from '@/utils/storage'

export default function AboutScreen() {
  const { theme, styles } = useTheme()
  const [count, setCount] = useState(0)
  const settings = useAppSettings()
  const alert = useAlertService()
  useEffect(() => {
    if (count === 3) {
      settings.update((prev) => ({
        ...prev,
        googleSigninEnabled: true,
      }))
      alert.alertWithType('success', '哈哈', 'Google 登陆已启用')
    }
  }, [count])
  return (
    <SafeAreaView className="flex-1">
      <MaxWidthWrapper>
        <View className="flex-1 px-2 pb-8 items-center justify-center">
          <Pressable
            className="w-full py-3 rounded-lg active:opacity-80"
            style={styles.layer1}
            onPress={() => {
              setCount((prev) => prev + 1)
            }}>
            <View className="my-2">
              <Text
                className="text-2xl font-bold text-center"
                style={styles.text}>
                R2V
              </Text>
            </View>
            <View className="my-2">
              <Text className="text-base text-center" style={styles.text}>
                V2EX 第三方客户端
              </Text>
            </View>
            <View>
              <Text className="text-center" style={styles.text}>
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
                <Text className="text-sm text-center" style={styles.text_meta}>
                  构建时间: {Constants.manifest.extra.buildTime}
                </Text>
              </View>
            )}

            <View className="flex flex-row items-center justify-center pt-2 gap-2">
              <Pressable
                className="p-2 flex flex-row items-center rounded-lg active:bg-neutral-100 active:opacity-60"
                onPress={() => {
                  Linking.openURL('https://github.com/kucial/v2ex-react-native')
                }}>
                <GithubIcon color={theme.colors.text} />
              </Pressable>
              <Pressable
                className="p-2 flex flex-row items-center rounded-lg active:bg-neutral-100 active:opacity-60"
                onPress={() => {
                  Linking.openURL(
                    'https://apps.apple.com/cn/app/r2v/id1645766550',
                  )
                }}>
                <ArrowUpOnSquareIcon color={theme.colors.text} />
              </Pressable>
            </View>
          </Pressable>
          <View className="py-2 w-full flex flex-row">
            <View className="basis-1/2 pr-2">
              <Pressable
                className={classNames(
                  'h-[50px] rounded-md flex items-center justify-center mt-4',
                  'active:opacity-60',
                )}
                style={[styles.layer1]}
                onPress={async () => {
                  // clear swr cache
                  const keys = storage.getAllKeys()
                  keys.forEach((key) => {
                    if (/\$app\$/.test(key)) {
                      return
                    }
                    storage.delete(key)
                  })
                  Image.clearDiskCache()
                  await CookieManager.clearAll()
                  RNRestart.Restart()
                }}>
                <Text style={styles.text}>清除缓存</Text>
              </Pressable>
            </View>
            <View className="basis-1/2 pl-2">
              <Pressable
                className={classNames(
                  'h-[50px] rounded-md flex items-center justify-center mt-4',
                  'active:opacity-60',
                )}
                style={[styles.layer1]}
                onPress={async () => {
                  storage.clearAll()
                  Image.clearDiskCache()
                  await CookieManager.clearAll()
                  RNRestart.Restart()
                }}>
                <Text style={styles.text_danger}>重置</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </MaxWidthWrapper>
    </SafeAreaView>
  )
}
