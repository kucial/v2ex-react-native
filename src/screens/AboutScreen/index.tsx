import { useEffect, useState } from 'react'
import {
  Alert as NativeAlert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Share from 'react-native-share'
import Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import { stringify } from 'qs'

import AppBrandIcon from '@/components/AppBrandIcon'
import GithubIcon from '@/components/GithubIcon'
import GroupWapper from '@/components/GroupWrapper'
import V2exIcon from '@/components/icons/V2exIcon'
import { LineItem } from '@/components/LineItem'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import NavigationHeader from '@/components/NavigationHeader'

import { useAlertService } from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import {
  getSelectedUpdateChannel,
  switchUpdateChannel,
  UpdateChannel,
} from '@/lib/update-channel'
import { clearCache, reset } from '@/utils/app-state'

const IOS_APP_ID = '1645766550'

export default function AboutScreen() {
  const { theme, styles } = useTheme()
  const [count, setCount] = useState(0)
  const [showUpdateChannel, setShowUpdateChannel] = useState(false)
  const [updateChannel, setUpdateChannel] = useState(
    getSelectedUpdateChannel,
  )
  const [switchingChannel, setSwitchingChannel] = useState(false)
  const settings = useAppSettings()
  const alert = useAlertService()
  const router = useRouter()
  useEffect(() => {
    if (count === 3 && !settings.data.googleSigninEnabled) {
      settings.update((prev) => ({
        ...prev,
        googleSigninEnabled: true,
      }))
      alert.show({ type: 'success', message: '😁 Google 登陆已启用' })
    }
  }, [alert, count, settings.data.googleSigninEnabled, settings.update])

  useEffect(() => {
    if (count === 5) {
      setShowUpdateChannel(true)
      alert.show({ type: 'success', message: 'OTA 更新频道设置已启用' })
    }
  }, [alert, count])

  const selectUpdateChannel = (channel: UpdateChannel) => {
    if (channel === updateChannel || switchingChannel) return
    setSwitchingChannel(true)
    void switchUpdateChannel(channel)
      .then(({ updateAvailable }) => {
        setUpdateChannel(channel)
        if (!updateAvailable) {
          alert.show({
            type: 'success',
            message: `已切换到 ${channel}，暂无可用更新`,
          })
        }
      })
      .catch((error: unknown) => {
        alert.show({
          type: 'error',
          message:
            error instanceof Error ? error.message : '切换更新频道失败',
        })
      })
      .finally(() => setSwitchingChannel(false))
  }

  const openUpdateChannelPicker = () => {
    NativeAlert.alert(
      'OTA 更新频道',
      `当前选择：${updateChannel}\n切换后会检查兼容当前运行时的更新。`,
      [
        {
          text: 'Production',
          onPress: () => selectUpdateChannel('production'),
        },
        { text: 'Preview', onPress: () => selectUpdateChannel('preview') },
        { text: '取消', style: 'cancel' },
      ],
    )
  }
  return (
    <View style={aboutStyles.container}>
      <NavigationHeader canGoBack title='关于' />
      <ScrollView style={aboutStyles.scrollView}>
        <MaxWidthWrapper style={aboutStyles.maxWidth}>
          <GroupWapper>
            <Pressable
              style={({ pressed }) => [
                aboutStyles.brandBtn,
                styles.grouped_secondary,
                pressed && aboutStyles.pressed,
              ]}
              onPress={() => {
                setCount((prev) => prev + 1)
              }}
            >
              <View style={aboutStyles.mb3}>
                <View style={aboutStyles.centerRow}>
                  <View>
                    <AppBrandIcon width={72} />
                  </View>
                </View>
              </View>
              <View style={aboutStyles.mb2}>
                <View>
                  <Text
                    style={[
                      styles.text,
                      styles.text_base,
                      aboutStyles.titleText,
                    ]}
                  >
                    R2V
                  </Text>
                </View>
                <View>
                  <Text
                    style={[
                      styles.text,
                      styles.text_xs,
                      aboutStyles.centerText,
                    ]}
                  >
                    V2EX 第三方客户端 ({Constants.expoConfig?.version})
                  </Text>
                </View>
                <View style={aboutStyles.mt1}>
                  <Text
                    style={[
                      styles.text_meta,
                      styles.text_xs,
                      aboutStyles.centerText,
                    ]}
                  >
                    {Constants.expoConfig?.extra.buildTag}
                  </Text>
                </View>
              </View>
              <View style={[aboutStyles.divider, styles.border_b]} />
            </Pressable>

            <LineItem
              style={styles.grouped_secondary}
              onPress={async () => {
                Linking.openURL('https://github.com/kucial/v2ex-react-native')
              }}
              icon={<GithubIcon color={theme.colors.primary} />}
              title='Github'
            />
            {showUpdateChannel ? (
              <LineItem
                style={styles.grouped_secondary}
                disabled={switchingChannel}
                onPress={openUpdateChannelPicker}
                icon={
                  <V2exIcon
                    name='arrow-path-outline'
                    size={22}
                    color={theme.colors.primary}
                  />
                }
                title='OTA 更新频道'
                extra={
                  <Text style={[styles.text_meta, styles.text_sm]}>
                    {switchingChannel ? '检查中…' : updateChannel}
                  </Text>
                }
              />
            ) : null}
            {Platform.OS === 'ios' && (
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
                  icon={
                    <V2exIcon
                      name='arrow-up-on-square-outline'
                      size={22}
                      color={theme.colors.primary}
                    />
                  }
                  title='分享'
                />
                <LineItem
                  style={styles.grouped_secondary}
                  onPress={() => {
                    Linking.openURL(
                      `itms-apps://apps.apple.com/app/id${IOS_APP_ID}?action=write-review`,
                    )
                  }}
                  icon={
                    <V2exIcon
                      name='star-outline'
                      size={22}
                      color={theme.colors.primary}
                    />
                  }
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
                <V2exIcon
                  name='chat-bubble-left-ellipsis-outline'
                  size={22}
                  color={theme.colors.primary}
                />
              }
              title='意见反馈'
              isLast
            />
          </GroupWapper>

          <View style={aboutStyles.btnRow}>
            <View style={aboutStyles.btnColLeft}>
              <GroupWapper>
                <Pressable
                  style={({ pressed }) => [
                    aboutStyles.actionBtn,
                    styles.grouped_secondary,
                    pressed && aboutStyles.pressed,
                  ]}
                  onPress={clearCache}
                >
                  <Text style={styles.text}>清除缓存</Text>
                </Pressable>
              </GroupWapper>
            </View>
            <View style={aboutStyles.btnColRight}>
              <GroupWapper>
                <Pressable
                  style={({ pressed }) => [
                    aboutStyles.actionBtn,
                    styles.grouped_secondary,
                    pressed && aboutStyles.pressed,
                  ]}
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

const aboutStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 20,
  },
  maxWidth: {
    paddingHorizontal: 8,
  },
  brandBtn: {
    paddingTop: 24,
  },
  pressed: {
    opacity: 0.8,
  },
  mb3: {
    marginBottom: 12,
  },
  centerRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  mb2: {
    marginBottom: 8,
  },
  titleText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  mt1: {
    marginTop: 4,
  },
  divider: {
    marginLeft: 16,
    height: 8,
  },
  btnRow: {
    paddingVertical: 8,
    width: '100%',
    flexDirection: 'row',
  },
  btnColLeft: {
    flex: 1,
    paddingRight: 8,
  },
  btnColRight: {
    flex: 1,
    paddingLeft: 8,
  },
  actionBtn: {
    height: 50,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
})
