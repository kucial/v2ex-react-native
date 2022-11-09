import { useEffect, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { IMGUR_CLIENT_ID } from '@env'
import classNames from 'classnames'
import * as Clipboard from 'expo-clipboard'
import * as Linking from 'expo-linking'
import colors from 'tailwindcss/colors'
import { useColorScheme } from 'tailwindcss-react-native'

import ImgurLogo from '@/components/ImgurLogo'
import { useAlertService } from '@/containers/AlertService'
import { useImgurService } from '@/containers/ImgurService'
import { getJSON } from '@/utils/storage'

const CACHE_KEY = `$app$/settings/imgur`

export function ImgurSettings(props) {
  const { route, navigation } = props
  const { colorScheme } = useColorScheme()
  const alert = useAlertService()
  const imgurService = useImgurService()
  const [clientInfo, setClientInfo] = useState(
    getJSON(CACHE_KEY, {
      clientId: IMGUR_CLIENT_ID,
    }),
  )
  const REDIRECT_URI = Linking.createURL('imgur-oauth')
  useEffect(() => {
    const subscription = Linking.addEventListener('url', function (event) {
      const parsed = Linking.parse(event.url)
      if (parsed.hostname === 'imgur-oauth') {
        const { queryParams } = Linking.parse(`?${event.url.split('#')[1]}`)
        if (queryParams) {
          imgurService.updateCredentials({
            client_id: clientInfo.clientId,
            ...queryParams,
          })
          alert.alertWithType('success', '成功', 'Imgur 授权成功')
          if (route.params?.autoBack) {
            navigation.goBack()
          }
        }
      }
    })
    return () => {
      subscription.remove()
    }
  }, [])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="p-3 mt-5 mx-4 rounded-lg bg-white dark:bg-neutral-900">
        <View className="flex flex-row justify-center mt-2 mb-3">
          <ImgurLogo
            style={{ width: 80, height: (80 / 220) * 79 }}
            color={
              colorScheme === 'dark' ? colors.neutral[200] : colors.neutral[900]
            }
          />
        </View>
        {imgurService.credentials ? (
          <View>
            <View>
              <Text
                className={classNames(
                  'text-sm pl-2 pb-[2px] dark:text-neutral-300',
                )}>
                Client ID
              </Text>
              <View className="h-[44px] px-2 bg-neutral-100 dark:bg-neutral-800 mb-2 rounded-md flex flex-row items-center">
                <Text className="dark:text-neutral-300">
                  {imgurService.credentials.client_id}
                </Text>
              </View>
            </View>
            <View>
              <Text
                className={classNames(
                  'text-sm pl-2 pb-[2px] dark:text-neutral-300',
                )}>
                Account Username
              </Text>
              <View className="h-[44px] px-2 bg-neutral-100 dark:bg-neutral-800 mb-2 rounded-md flex flex-row items-center">
                <Text className="dark:text-neutral-300">
                  {imgurService.credentials.account_username}
                </Text>
              </View>
            </View>
            <View>
              <Text
                className={classNames(
                  'text-sm pl-2 pb-[2px] dark:text-neutral-300',
                )}>
                Access Token
              </Text>
              <TextInput
                secureTextEntry
                editable={false}
                className="h-[44px] px-2 bg-neutral-100 dark:bg-neutral-800 mb-2 rounded-md flex flex-row items-center dark:text-neutral-300"
                value={imgurService.credentials.access_token}
              />
            </View>
            <Pressable
              className={classNames(
                'h-[44px] rounded-md flex items-center justify-center active:opacity-60 mt-4 mb-4',
                'bg-neutral-900',
                'dark:bg-amber-50',
              )}
              onPress={() => {
                imgurService.updateCredentials()
              }}>
              <Text className="text-white text-sm dark:text-neutral-900">
                重置
              </Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <View className="px-3 py-1 border-l-2 border-neutral-900 dark:border-neutral-300">
              <Text className="text-neutral-500 dark:text-neutral-300 leading-[20px]">
                由于 Imgur 服务的资源限制，您可能需要在 imgur 上{' '}
                <Text
                  className="underline text-neutral-800 dark:text-amber-200"
                  onPress={() => {
                    Linking.openURL('https://api.imgur.com/oauth2/addclient')
                  }}>
                  创建应用
                </Text>
                ，并将 Authorization callback URL 设置为
              </Text>
              <Pressable
                className="h-[33px] mt-1 bg-neutral-100 dark:bg-neutral-800 flex flex-row items-center px-1 rounded active:opacity-60"
                onPress={async () => {
                  await Clipboard.setStringAsync(REDIRECT_URI)
                  alert.alertWithType('success', '', 'URL 已复制到剪切板')
                }}>
                <Text className="dark:text-neutral-300">{REDIRECT_URI}</Text>
              </Pressable>
            </View>
            <View className="mt-2">
              <Text
                className={classNames(
                  'text-sm pl-2 pb-[2px] dark:text-neutral-300',
                  {
                    'opacity-0': !clientInfo.clientId,
                  },
                )}>
                clientId
              </Text>
              <TextInput
                className="h-[44px] px-2 bg-neutral-100 mb-2 rounded-md dark:bg-neutral-800 dark:text-neutral-300"
                selectionColor={
                  colorScheme === 'dark'
                    ? colors.amber[50]
                    : colors.neutral[600]
                }
                placeholderTextColor={
                  colorScheme === 'dark'
                    ? colors.neutral[500]
                    : colors.neutral[400]
                }
                placeholder="Client Id"
                onChangeText={(value) =>
                  setClientInfo((prev) => ({
                    ...prev,
                    clientId: value,
                  }))
                }
                value={clientInfo.clientId}
                spellCheck={false}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>
            <Pressable
              className={classNames(
                'h-[44px] rounded-md flex items-center justify-center active:opacity-60 mt-4 mb-4',
                'bg-neutral-900',
                'dark:bg-amber-50',
              )}
              onPress={() => {
                if (!clientInfo.clientId) {
                  return
                }
                Linking.openURL(
                  `https://api.imgur.com/oauth2/authorize?client_id=${clientInfo.clientId}&response_type=token`,
                )
              }}>
              <Text className="text-white text-sm dark:text-neutral-900">
                授权
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}
