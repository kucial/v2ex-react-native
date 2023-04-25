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
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import classNames from 'classnames'
import * as Clipboard from 'expo-clipboard'
import * as Linking from 'expo-linking'
import colors from 'tailwindcss/colors'

import GroupWapper from '@/components/GroupWrapper'
import ImgurLogo from '@/components/ImgurLogo'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useAlertService } from '@/containers/AlertService'
import { useImgurService } from '@/containers/ImgurService'
import { ImgurCredentials } from '@/containers/ImgurService/types'
import { useTheme } from '@/containers/ThemeService'

const CACHE_KEY = `$app$/settings/imgur`

type ScreenProps = NativeStackScreenProps<AppStackParamList, 'imgur-settings'>
export default function ImgurSettings(props: ScreenProps) {
  const { route, navigation } = props
  const { theme, colorScheme, styles } = useTheme()
  const alert = useAlertService()
  const imgurService = useImgurService()
  const [clientInfo, setClientInfo] = useState({
    clientId: IMGUR_CLIENT_ID,
  })
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
          } as ImgurCredentials)
          alert.show({
            type: 'success',
            message: 'Imgur 授权成功',
          })
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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <MaxWidthWrapper style={{ flex: 1 }}>
        <View className="px-2 py-4 flex-1">
          <GroupWapper className="w-full">
            <View style={styles.layer1} className="p-4">
              <View className="items-center py-3">
                <ImgurLogo
                  style={{ width: 80, height: (80 / 220) * 79 }}
                  color={
                    colorScheme === 'dark'
                      ? colors.neutral[200]
                      : colors.neutral[900]
                  }
                />
              </View>
              {imgurService.credentials ? (
                <View>
                  <View>
                    <Text
                      className={classNames('text-sm pl-2 pb-[2px]')}
                      style={styles.text}>
                      Client ID
                    </Text>
                    <View
                      className="h-[44px] px-2 mb-2 rounded-md flex flex-row items-center"
                      style={styles.layer2}>
                      <Text style={styles.text}>
                        {imgurService.credentials.client_id}
                      </Text>
                    </View>
                  </View>
                  <View>
                    <Text
                      className={classNames('text-sm pl-2 pb-[2px]')}
                      style={styles.text}>
                      Account Username
                    </Text>
                    <View
                      className="h-[44px] px-2 mb-2 rounded-md flex flex-row items-center"
                      style={styles.layer2}>
                      <Text style={styles.text}>
                        {imgurService.credentials.account_username}
                      </Text>
                    </View>
                  </View>
                  <View>
                    <Text
                      className={classNames('text-sm pl-2 pb-[2px]')}
                      style={styles.text}>
                      Access Token
                    </Text>
                    <TextInput
                      secureTextEntry
                      editable={false}
                      className="h-[44px] px-2 mb-2 rounded-md flex flex-row items-center"
                      style={[styles.text, styles.layer2]}
                      value={imgurService.credentials.access_token}
                    />
                  </View>
                  <Pressable
                    className={classNames(
                      'h-[44px] rounded-md flex items-center justify-center active:opacity-60 mt-4 mb-4',
                    )}
                    style={styles.btn_primary__bg}
                    onPress={() => {
                      imgurService.updateCredentials()
                    }}>
                    <Text className="text-sm" style={styles.btn_primary__text}>
                      重置
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View>
                  <View
                    className="px-3 py-1 border-l-2"
                    style={{
                      borderColor: theme.colors.primary,
                    }}>
                    <Text className="leading-[20px]" style={styles.text_meta}>
                      由于 Imgur 服务的资源限制，您可能需要在 imgur 上{' '}
                      <Text
                        className="underline"
                        style={styles.text_link}
                        onPress={() => {
                          Linking.openURL(
                            'https://api.imgur.com/oauth2/addclient',
                          )
                        }}>
                        创建应用
                      </Text>
                      ，并将 Authorization callback URL 设置为
                    </Text>
                    <Pressable
                      className="h-[33px] mt-1 flex flex-row items-center px-1 rounded active:opacity-60"
                      style={styles.layer2}
                      onPress={async () => {
                        await Clipboard.setStringAsync(REDIRECT_URI)
                        alert.show({
                          type: 'success',
                          message: ' URL 已复制到剪切板',
                        })
                      }}>
                      <Text style={styles.text}>{REDIRECT_URI}</Text>
                    </Pressable>
                  </View>
                  <View className="mt-2">
                    <Text
                      className={classNames('text-sm pl-2 pb-[2px]', {
                        'opacity-0': !clientInfo.clientId,
                      })}
                      style={styles.text}>
                      clientId
                    </Text>
                    <TextInput
                      className="h-[44px] px-2 mb-2 rounded-md"
                      style={[styles.text, styles.layer2]}
                      selectionColor={theme.colors.primary}
                      placeholderTextColor={theme.colors.text_placeholder}
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
                    )}
                    style={styles.btn_primary__bg}
                    onPress={() => {
                      if (!clientInfo.clientId) {
                        return
                      }
                      Linking.openURL(
                        `https://api.imgur.com/oauth2/authorize?client_id=${clientInfo.clientId}&response_type=token`,
                      )
                    }}>
                    <Text className="text-sm" style={styles.btn_primary__text}>
                      授权
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </GroupWapper>
        </View>
      </MaxWidthWrapper>
    </KeyboardAvoidingView>
  )
}
