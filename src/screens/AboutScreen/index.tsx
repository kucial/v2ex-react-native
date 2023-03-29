import { useEffect, useState } from 'react'
import {
  Image,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native'
import {
  ArrowUpOnSquareIcon,
  ChatBubbleLeftEllipsisIcon,
  StarIcon,
} from 'react-native-heroicons/outline'
import RNRestart from 'react-native-restart'
import * as StoreReview from 'react-native-store-review'
import CookieManager from '@react-native-cookies/cookies'
import classNames from 'classnames'
import Constants from 'expo-constants'
import { stringify } from 'qs'

import GithubIcon from '@/components/GithubIcon'
import GroupWapper from '@/components/GroupWrapper'
import { LineItem } from '@/components/LineItem'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useAlertService } from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { staticAsset } from '@/utils/assets'
import storage from '@/utils/storage'

export default function AboutScreen(props) {
  const { theme, styles, colorScheme } = useTheme()
  const [count, setCount] = useState(0)
  const settings = useAppSettings()
  const alert = useAlertService()
  useEffect(() => {
    if (count === 3) {
      settings.update((prev) => ({
        ...prev,
        googleSigninEnabled: true,
      }))
      alert.alertWithType('success', '😁', 'Google 登陆已启用')
    }
  }, [count])
  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 pt-5">
        <MaxWidthWrapper className="px-2">
          <GroupWapper>
            <Pressable
              className="pt-3 active:opacity-80"
              style={styles.layer1}
              onPress={() => {
                setCount((prev) => prev + 1)
              }}>
              <View className="my-5">
                <View className="flex-1 flex flex-row justify-center">
                  <Image
                    source={{
                      uri:
                        colorScheme === 'light'
                          ? staticAsset('brand-default.png')
                          : staticAsset('brand-inverse.png'),
                    }}
                    style={{ width: 120, height: (120 * 819) / 1085 }}
                  />
                </View>
                {/* <Text
                  className="text-2xl font-bold text-center"
                  style={styles.text}>
                  R2V
                </Text> */}
              </View>
              <View className="my-2">
                <Text className="text-base text-center" style={styles.text}>
                  V2EX 第三方客户端
                </Text>
              </View>
              <View>
                <Text className="text-center" style={styles.text}>
                  {Constants.manifest.version}
                </Text>
              </View>

              <View className="mt-2">
                <Text className="text-sm text-center" style={styles.text_meta}>
                  {Constants.manifest.extra.buildTag}
                </Text>
              </View>
              <View className="ml-4 h-[20]" style={styles.border_b} />
            </Pressable>

            <LineItem
              onPress={async () => {
                Linking.openURL('https://github.com/kucial/v2ex-react-native')
              }}
              icon={<GithubIcon color={theme.colors.primary} />}
              title="Github"
            />
            <LineItem
              onPress={async () => {
                try {
                  const result = await Share.share({
                    message: 'R2V -- 第三方V2EX客户端',
                    url: 'https://apps.apple.com/cn/app/r2v/id1645766550',
                  })
                  if (result.action === Share.sharedAction) {
                    if (result.activityType) {
                      // shared with activity type of result.activityType
                    } else {
                      // shared
                    }
                  } else if (result.action === Share.dismissedAction) {
                    // dismissed
                  }
                } catch (error) {
                  console.log(error.message)
                }
              }}
              icon={<ArrowUpOnSquareIcon color={theme.colors.primary} />}
              title="分享"
            />
            <LineItem
              onPress={() => {
                StoreReview.requestReview()
              }}
              icon={<StarIcon size={22} color={theme.colors.primary} />}
              title="五星好评"
            />
            <LineItem
              onPress={async () => {
                try {
                  const params = {
                    subject: `R2V (${Constants.manifest.extra.buildTag}) 意见反馈`,
                  }
                  console.log(
                    `mailto:kongkx.yang@gmail.com?${stringify(params)}`,
                  )
                  await Linking.openURL(
                    `mailto:kongkx.yang@gmail.com?${stringify(params)}`,
                  )
                } catch (err) {
                  props.navigation.push('feedback')
                }
              }}
              icon={
                <ChatBubbleLeftEllipsisIcon
                  size={22}
                  color={theme.colors.primary}
                />
              }
              title="意见反馈"
              isLast
            />
          </GroupWapper>

          <View className="py-2 w-full flex flex-row">
            <View className="basis-1/2 pr-2">
              <GroupWapper>
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
                    await CookieManager.clearAll()
                    RNRestart.Restart()
                  }}>
                  <Text style={styles.text}>清除缓存</Text>
                </Pressable>
              </GroupWapper>
            </View>
            <View className="basis-1/2 pl-2">
              <GroupWapper>
                <Pressable
                  className={classNames(
                    'h-[50px] rounded-md flex items-center justify-center mt-4',
                    'active:opacity-60',
                  )}
                  style={[styles.layer1]}
                  onPress={async () => {
                    storage.clearAll()
                    await CookieManager.clearAll()
                    RNRestart.Restart()
                  }}>
                  <Text style={styles.text_danger}>重置</Text>
                </Pressable>
              </GroupWapper>
            </View>
          </View>
        </MaxWidthWrapper>
      </ScrollView>
    </SafeAreaView>
  )
}
