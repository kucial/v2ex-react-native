import {
  View,
  Text,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Image
} from 'react-native'
import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import { useForm, Controller } from 'react-hook-form'
import * as Clipboard from 'expo-clipboard'
import * as Linking from 'expo-linking'
import colors from 'tailwindcss/colors'

import { IMGUR_CLIENT_ID } from '@env'
import Loader from '@/components/Loader'
import { LineItemGroup } from '@/components/LineItem'
import { useAlertService } from '@/containers/AlertService'
import imgurLogo from '@/assets/imgur_logo.png'
import { getJSON } from '@/utils/storage'
import { useImgurService } from '@/containers/ImgurService'

const CACHE_KEY = `$app$/settings/imgur`

export function ImgurSettings(props) {
  const { route, navigation } = props
  const alert = useAlertService()
  const imgurService = useImgurService()
  const [clientInfo, setClientInfo] = useState(
    getJSON(CACHE_KEY, {
      clientId: IMGUR_CLIENT_ID
    })
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
            ...queryParams
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
      <LineItemGroup className="bg-white p-3">
        <View className="flex flex-row justify-center mt-2 mb-3">
          <Image
            source={imgurLogo}
            style={{ width: 80, height: (80 / 220) * 79 }}
          />
        </View>
        {imgurService.credentials ? (
          <View>
            <View>
              <Text className={classNames('text-sm pl-2 pb-[2px]')}>
                Client ID
              </Text>
              <View className="h-[44px] px-2 bg-gray-100 mb-2 rounded-md flex flex-row items-center">
                <Text>{imgurService.credentials.client_id}</Text>
              </View>
            </View>
            <View>
              <Text className={classNames('text-sm pl-2 pb-[2px]')}>
                Account Username
              </Text>
              <View className="h-[44px] px-2 bg-gray-100 mb-2 rounded-md flex flex-row items-center">
                <Text>{imgurService.credentials.account_username}</Text>
              </View>
            </View>
            <View>
              <Text className={classNames('text-sm pl-2 pb-[2px]')}>
                Access Token
              </Text>
              <TextInput
                secureTextEntry
                editable={false}
                className="h-[44px] px-2 bg-gray-100 mb-2 rounded-md flex flex-row items-center"
                value={imgurService.credentials.access_token}
              />
            </View>
            <Pressable
              className={classNames(
                'h-[44px] bg-gray-900 rounded-md flex items-center justify-center active:opacity-60 mt-4 mb-4'
              )}
              onPress={() => {
                imgurService.updateCredentials()
              }}>
              <Text className="text-white text-sm">重置</Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <View className="px-3 py-1 border-l-2 border-gray-900">
              <Text className="text-gray-500 leading-[20px]">
                由于 Imgur 服务的资源限制，您可能需要在 imgur 上{' '}
                <Text
                  className="underline text-gray-800"
                  onPress={() => {
                    Linking.openURL('https://api.imgur.com/oauth2/addclient')
                  }}>
                  创建应用
                </Text>
                ，并将 Authorization callback URL 设置为
              </Text>
              <Pressable
                className="h-[33px] mt-1 bg-gray-100 flex flex-row items-center px-1 rounded active:opacity-60"
                onPress={async () => {
                  await Clipboard.setStringAsync(REDIRECT_URI)
                  alert.alertWithType('success', '', 'URL 已复制到剪切板')
                }}>
                <Text>{REDIRECT_URI}</Text>
              </Pressable>
            </View>
            <View className="mt-2">
              <Text
                className={classNames('text-sm pl-2 pb-[2px]', {
                  'opacity-0': !clientInfo.clientId
                })}>
                clientId
              </Text>
              <TextInput
                className="h-[44px] px-2 bg-gray-100 mb-2 rounded-md"
                placeholder="Client Id"
                onChangeText={(value) =>
                  setClientInfo((prev) => ({
                    ...prev,
                    clientId: value
                  }))
                }
                value={clientInfo.clientId}
                selectionColor={colors.gray[600]}
                spellCheck={false}
                autoCorrect={false}
                autoCapitalize="none"
              />
            </View>
            <Pressable
              className={classNames(
                'h-[44px] bg-gray-900 rounded-md flex items-center justify-center active:opacity-60 mt-4 mb-4'
              )}
              onPress={() => {
                if (!clientInfo.clientId) {
                  return
                }
                Linking.openURL(
                  `https://api.imgur.com/oauth2/authorize?client_id=${clientInfo.clientId}&response_type=token`
                )
              }}>
              <Text className="text-white text-sm">授权</Text>
            </Pressable>
          </View>
        )}
      </LineItemGroup>
    </KeyboardAvoidingView>
  )
}
