import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import * as Clipboard from 'expo-clipboard'
import * as Crypto from 'expo-crypto'
import * as Linking from 'expo-linking'
import { useLocalSearchParams } from 'expo-router'

import GroupWapper from '@/components/GroupWrapper'
import ImgurLogo from '@/components/ImgurLogo'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import NavigationHeader from '@/components/NavigationHeader'

import { useAlertService } from '@/containers/AlertService'
import { useImgurService } from '@/containers/ImgurService'
import { useTheme } from '@/containers/ThemeService'
import { IMGUR_CLIENT_ID } from '@/env'
import {
  createImgurAuthorizationUrl,
  IMGUR_OAUTH_CALLBACK_PATH,
} from '@/utils/imgur-oauth'
import {
  clearPendingImgurOAuth,
  savePendingImgurOAuth,
} from '@/utils/imgur-oauth-pending'

const IMGUR_REDIRECT_URI = Linking.createURL(IMGUR_OAUTH_CALLBACK_PATH)

export default function ImgurSettings() {
  const params = useLocalSearchParams()
  const autoBack = params.autoBack === '1'

  const { theme, styles } = useTheme()
  const alert = useAlertService()
  const imgurService = useImgurService()
  const [clientInfo, setClientInfo] = useState({
    clientId: IMGUR_CLIENT_ID,
  })

  return (
    <View style={imgurStyles.container}>
      <NavigationHeader canGoBack title={'Imgur 设置'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={imgurStyles.container}
      >
        <MaxWidthWrapper style={imgurStyles.container}>
          <View style={imgurStyles.innerCol}>
            <GroupWapper style={imgurStyles.wFull}>
              <View style={[styles.layer1, imgurStyles.p4]}>
                <View style={imgurStyles.logoWrap}>
                  <ImgurLogo
                    style={{ width: 80, height: (80 / 220) * 79 }}
                    color={theme.colors.text}
                  />
                </View>
                {imgurService.credentials ? (
                  <View>
                    <View>
                      <Text
                        style={[
                          imgurStyles.labelText,
                          styles.text,
                          styles.text_sm,
                        ]}
                      >
                        Client ID
                      </Text>
                      <View style={[imgurStyles.boxRow, styles.layer2]}>
                        <Text style={styles.text}>
                          {imgurService.credentials.client_id}
                        </Text>
                      </View>
                    </View>
                    <View>
                      <Text
                        style={[
                          imgurStyles.labelText,
                          styles.text,
                          styles.text_sm,
                        ]}
                      >
                        Account Username
                      </Text>
                      <View style={[imgurStyles.boxRow, styles.layer2]}>
                        <Text style={styles.text}>
                          {imgurService.credentials.account_username}
                        </Text>
                      </View>
                    </View>
                    <View>
                      <Text
                        style={[
                          imgurStyles.labelText,
                          styles.text,
                          styles.text_sm,
                        ]}
                      >
                        Access Token
                      </Text>
                      <TextInput
                        secureTextEntry
                        editable={false}
                        style={[imgurStyles.boxRow, styles.text, styles.layer2]}
                        value={imgurService.credentials.access_token}
                      />
                    </View>
                    <Pressable
                      style={({ pressed }) => [
                        imgurStyles.btn,
                        styles.btn_primary__bg,
                        pressed && imgurStyles.pressed60,
                      ]}
                      onPress={() => {
                        imgurService.updateCredentials()
                      }}
                    >
                      <Text style={[styles.btn_primary__text, styles.text_sm]}>
                        重置
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <View>
                    <View
                      style={[
                        imgurStyles.noticeBox,
                        {
                          borderColor: theme.colors.primary,
                        },
                      ]}
                    >
                      <Text style={[imgurStyles.leading20, styles.text_meta]}>
                        由于 Imgur 服务的资源限制，您可能需要在 imgur 上{' '}
                        <Text
                          style={[imgurStyles.underline, styles.text_link]}
                          onPress={() => {
                            Linking.openURL(
                              'https://api.imgur.com/oauth2/addclient',
                            )
                          }}
                        >
                          创建应用
                        </Text>
                        ，并将 Authorization callback URL 设置为
                      </Text>
                      <Pressable
                        style={({ pressed }) => [
                          imgurStyles.urlBox,
                          styles.layer2,
                          pressed && imgurStyles.pressed60,
                        ]}
                        onPress={async () => {
                          await Clipboard.setStringAsync(IMGUR_REDIRECT_URI)
                          alert.show({
                            type: 'success',
                            message: ' URL 已复制到剪切板',
                          })
                        }}
                      >
                        <Text style={styles.text}>{IMGUR_REDIRECT_URI}</Text>
                      </Pressable>
                    </View>
                    <View style={imgurStyles.mt2}>
                      <Text
                        style={[
                          imgurStyles.labelText,
                          !clientInfo.clientId && imgurStyles.opacity0,
                          styles.text,
                          styles.text_sm,
                        ]}
                      >
                        clientId
                      </Text>
                      <TextInput
                        style={[imgurStyles.boxRow, styles.text, styles.layer2]}
                        placeholderTextColor={theme.colors.text_placeholder}
                        placeholder='Client Id'
                        onChangeText={(value) =>
                          setClientInfo((prev) => ({
                            ...prev,
                            clientId: value,
                          }))
                        }
                        value={clientInfo.clientId}
                        spellCheck={false}
                        autoCorrect={false}
                        autoCapitalize='none'
                      />
                    </View>
                    <Pressable
                      style={({ pressed }) => [
                        imgurStyles.btn,
                        styles.btn_primary__bg,
                        pressed && imgurStyles.pressed60,
                      ]}
                      onPress={async () => {
                        if (!clientInfo.clientId) {
                          return
                        }

                        const state = Crypto.randomUUID()
                        savePendingImgurOAuth({
                          clientId: clientInfo.clientId,
                          state,
                          autoBack,
                          createdAt: Date.now(),
                        })

                        try {
                          await Linking.openURL(
                            createImgurAuthorizationUrl({
                              clientId: clientInfo.clientId,
                              redirectUri: IMGUR_REDIRECT_URI,
                              state,
                            }),
                          )
                        } catch {
                          clearPendingImgurOAuth()
                          alert.show({
                            type: 'error',
                            message: '无法打开 Imgur 授权页面。',
                          })
                        }
                      }}
                    >
                      <Text style={[styles.btn_primary__text, styles.text_sm]}>
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
    </View>
  )
}

const imgurStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerCol: {
    paddingHorizontal: 8,
    paddingVertical: 16,
    flex: 1,
  },
  wFull: {
    width: '100%',
  },
  p4: {
    padding: 16,
  },
  logoWrap: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  labelText: {
    paddingLeft: 8,
    paddingBottom: 2,
  },
  boxRow: {
    height: 44,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    height: 44,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  pressed60: {
    opacity: 0.6,
  },
  noticeBox: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderLeftWidth: 2,
  },
  leading20: {
    lineHeight: 20,
  },
  underline: {
    textDecorationLine: 'underline',
  },
  urlBox: {
    height: 33,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  mt2: {
    marginTop: 8,
  },
  opacity0: {
    opacity: 0,
  },
})
