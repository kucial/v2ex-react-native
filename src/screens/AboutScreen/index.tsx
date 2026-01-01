import { useEffect, useState } from 'react'
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import {
  ArrowUpOnSquareIcon,
  ChatBubbleLeftEllipsisIcon,
  StarIcon,
} from 'react-native-heroicons/outline'
import Share from 'react-native-share'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import { stringify } from 'qs'

import AppBrandIcon from '@/components/AppBrandIcon'
import GithubIcon from '@/components/GithubIcon'
import GroupWapper from '@/components/GroupWrapper'
import { LineItem } from '@/components/LineItem'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import NavigationHeader from '@/components/NavigationHeader'

import { useAlertService } from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { IOS_APP_ID } from '@/env'
import { cn } from '@/lib/utils'
import { clearCache, reset } from '@/utils/app-state'

export default function AboutScreen() {
  const { theme, styles } = useTheme()
  const [count, setCount] = useState(0)
  const settings = useAppSettings()
  const alert = useAlertService()
  const router = useRouter()
  useEffect(() => {
    if (count === 3) {
      settings.update((prev) => ({
        ...prev,
        googleSigninEnabled: true,
      }))
      alert.show({ type: 'success', message: '😁 Google 登陆已启用' })
    }
  }, [count])
  return (
    <View className='flex-1'>
      <NavigationHeader canGoBack title='关于' />
      <ScrollView className='flex-1 pt-5'>
        <MaxWidthWrapper className='px-2'>
          <GroupWapper>
            <Pressable
              className='pt-6 active:opacity-80'
              style={styles.grouped_secondary}
              onPress={() => {
                setCount((prev) => prev + 1)
              }}
            >
              <View className='mb-3'>
                <View className='flex-1 flex flex-row justify-center'>
                  <View className=''>
                    <AppBrandIcon width={72} />
                  </View>
                </View>
              </View>
              <View className='mb-2'>
                <View>
                  <Text
                    className='font-medium text-center'
                    style={[styles.text, styles.text_base]}
                  >
                    R2V
                  </Text>
                </View>
                <View>
                  <Text
                    className='text-center'
                    style={[styles.text, styles.text_xs]}
                  >
                    V2EX 第三方客户端 ({Constants.expoConfig?.version})
                  </Text>
                </View>
                <View className='mt-1'>
                  <Text
                    className='text-center'
                    style={[styles.text_meta, styles.text_xs]}
                  >
                    {Constants.expoConfig?.extra.buildTag}
                  </Text>
                </View>
              </View>
              <View className='ml-4 h-2' style={styles.border_b} />
            </Pressable>

            <LineItem
              style={styles.grouped_secondary}
              onPress={async () => {
                Linking.openURL('https://github.com/kucial/v2ex-react-native')
              }}
              icon={<GithubIcon color={theme.colors.primary} />}
              title='Github'
            />
            {Platform.OS === 'ios' && IOS_APP_ID && (
              <>
                <LineItem
                  style={styles.grouped_secondary}
                  onPress={async () => {
                    try {
                      await Share.open({
                        title: 'R2V -- 第三方V2EX客户端',
                        message: 'R2V -- 第三方V2EX客户端',
                        url: `https://apps.apple.com/us/app/r2v/id${IOS_APP_ID}`,
                      })
                    } catch (error) {
                      console.log(error.message)
                    }
                  }}
                  icon={<ArrowUpOnSquareIcon color={theme.colors.primary} />}
                  title='分享'
                />
                <LineItem
                  style={styles.grouped_secondary}
                  onPress={() => {
                    Linking.openURL(
                      `itms-apps://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`,
                    )
                  }}
                  icon={<StarIcon size={22} color={theme.colors.primary} />}
                  title='五星好评'
                />
              </>
            )}

            <LineItem
              style={styles.grouped_secondary}
              onPress={async () => {
                try {
                  const params = {
                    subject: `R2V (${Constants.expoConfig.extra?.buildTag}) ${Platform.OS} 意见反馈`,
                  }
                  await Linking.openURL(
                    `mailto:kongkx.yang@gmail.com?${stringify(params)}`,
                  )
                } catch (err) {
                  console.log(err)
                  router.push('/feedback')
                }
              }}
              icon={
                <ChatBubbleLeftEllipsisIcon
                  size={22}
                  color={theme.colors.primary}
                />
              }
              title='意见反馈'
              isLast
            />
          </GroupWapper>

          <View className='py-2 w-full flex flex-row'>
            <View className='basis-1/2 pr-2'>
              <GroupWapper>
                <Pressable
                  className={cn(
                    'h-[50px] rounded-md flex items-center justify-center mt-4',
                    'active:opacity-60',
                  )}
                  style={[styles.grouped_secondary]}
                  onPress={clearCache}
                >
                  <Text style={styles.text}>清除缓存</Text>
                </Pressable>
              </GroupWapper>
            </View>
            <View className='basis-1/2 pl-2'>
              <GroupWapper>
                <Pressable
                  className={cn(
                    'h-[50px] rounded-md flex items-center justify-center mt-4',
                    'active:opacity-60',
                  )}
                  style={[styles.grouped_secondary]}
                  onPress={reset}
                >
                  <Text style={styles.text_danger}>重置</Text>
                </Pressable>
              </GroupWapper>
            </View>
          </View>
        </MaxWidthWrapper>
      </ScrollView>
    </View>
  )
}
