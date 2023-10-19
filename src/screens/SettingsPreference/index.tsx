import { useEffect, useRef, useState } from 'react'
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native'
import RNRestart from 'react-native-restart'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import classNames from 'classnames'

import GroupWapper from '@/components/GroupWrapper'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import MySwitch from '@/components/MySwitch'
import SectionHeader from '@/components/SectionHeader'
import { useAppSettings } from '@/containers/AppSettingsService'
import { SearchProvider } from '@/containers/AppSettingsService/types'
import { useTheme } from '@/containers/ThemeService'

import { topic } from './mock'
import NormalTopicRowDemo from './NormalTopicRowDemo'
import TideTopicRowDemo from './TideTopicRowDemo'
import { DemoRowProps } from './types'

const styleLabels = {
  normal: '默认',
  tide: '紧凑',
}

const titleStylesLabel = {
  normal: '默认',
  emphasized: '强调',
}

const refreshDurationOptions = [
  { value: 5, label: '5 分钟' },
  { value: 10, label: '10 分钟' },
  { value: 15, label: '15 分钟' },
  { value: 30, label: '30 分钟' },
]

const searchProviderOptions: Array<{
  value: SearchProvider
  label: string
}> = [
  { value: 'google', label: 'Google' },
  { value: 'sov2ex', label: 'sov2ex' },
]

const historyRecordLimitOptions: Array<{
  value: number | null
  label: string
}> = [
  { value: 100, label: '100条' },
  { value: 300, label: '300条' },
  { value: 500, label: '500条' },
  { value: null, label: '不限' },
]

type ScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'preference-settings'
>
export default function PreferenceSettings({ navigation }: ScreenProps) {
  const { data, update, staticUpdate } = useAppSettings()
  const [state, setState] = useState(data)
  const [viewedStatus, setViewedStatus] =
    useState<DemoRowProps['viewedStatus']>(undefined)
  const { styles } = useTheme()

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (state !== data) {
        if (state.payLayoutEnabled !== data.payLayoutEnabled) {
          e.preventDefault()
          staticUpdate(state)
          RNRestart.Restart()
        } else {
          update(state)
        }
      }
    })
    return unsubscribe
  }, [navigation, data, state])

  const timerRef = useRef(null)
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="flex-1 px-2">
        <MaxWidthWrapper>
          <SectionHeader title="显示" />
          <GroupWapper>
            <View className="">
              {state.feedLayout === 'normal' && (
                <NormalTopicRowDemo
                  data={topic}
                  showAvatar={state.feedShowAvatar}
                  showLastReplyMember={state.feedShowLastReplyMember}
                  titleStyle={state.feedTitleStyle}
                  viewedStatus={viewedStatus}
                />
              )}
              {state.feedLayout === 'tide' && (
                <TideTopicRowDemo
                  data={topic}
                  showAvatar={state.feedShowAvatar}
                  showLastReplyMember={state.feedShowLastReplyMember}
                  titleStyle={state.feedTitleStyle}
                  viewedStatus={viewedStatus}
                />
              )}
            </View>

            <Pressable
              className={classNames('pl-4', 'active:opacity-50')}
              style={styles.layer1}
              onPress={() => {
                const next = state.feedLayout === 'normal' ? 'tide' : 'normal'
                setState((prev) => ({
                  ...prev,
                  feedLayout: next,
                }))
              }}>
              <View
                className={classNames(
                  'min-h-[52px] flex flex-row items-center',
                )}
                style={[styles.border_b]}>
                <View className="flex-1">
                  <Text className="text-base" style={styles.text}>
                    列表布局
                  </Text>
                </View>
                <View className="mr-4 px-2">
                  <Text style={styles.text_desc}>
                    {styleLabels[state.feedLayout]}
                  </Text>
                </View>
              </View>
            </Pressable>
            <Pressable
              className={classNames('pl-4', 'active:opacity-50')}
              style={styles.layer1}
              onPress={() => {
                const next =
                  state.feedTitleStyle === 'normal' ? 'emphasized' : 'normal'
                setState((prev) => ({
                  ...prev,
                  feedTitleStyle: next,
                }))
              }}>
              <View
                className={classNames(
                  'min-h-[52px] flex flex-row items-center',
                )}
                style={[styles.border_b]}>
                <View className="flex-1">
                  <Text className="text-base" style={styles.text}>
                    标题样式
                  </Text>
                </View>
                <View className="mr-4 px-2">
                  <Text style={styles.text_desc}>
                    {titleStylesLabel[state.feedTitleStyle]}
                  </Text>
                </View>
              </View>
            </Pressable>
            <View className={classNames('pl-4')} style={styles.layer1}>
              <View
                className={classNames(
                  'min-h-[52px] flex flex-row items-center',
                )}
                style={styles.border_b}>
                <View className="flex-1">
                  <Text className="text-base" style={styles.text}>
                    显示头像
                  </Text>
                </View>
                <View className="mr-2 px-2">
                  <MySwitch
                    value={state.feedShowAvatar}
                    onValueChange={(val) =>
                      setState((prev) => ({
                        ...prev,
                        feedShowAvatar: val,
                      }))
                    }
                  />
                </View>
              </View>
            </View>
            <View className={classNames('pl-4')} style={styles.layer1}>
              <View
                className={classNames(
                  'min-h-[52px] flex flex-row items-center',
                )}
                style={styles.border_b}>
                <View className="flex-1">
                  <Text className="text-base" style={styles.text}>
                    显示最后回复用户
                  </Text>
                </View>
                <View className="mr-2 px-2">
                  <MySwitch
                    value={state.feedShowLastReplyMember}
                    onValueChange={(val) =>
                      setState((prev) => ({
                        ...prev,
                        feedShowLastReplyMember: val,
                      }))
                    }
                  />
                </View>
              </View>
            </View>
            <View className={classNames('pl-4')} style={styles.layer1}>
              <View
                className={classNames(
                  'min-h-[52px] flex flex-row items-center',
                )}
                style={styles.border_b}>
                <View className="flex-1">
                  <Text className="text-base" style={styles.text}>
                    已读提示
                  </Text>
                </View>
                <View className="mr-2 px-2">
                  <MySwitch
                    value={state.showHasViewed}
                    onValueChange={(val) => {
                      setState((prev) => ({
                        ...prev,
                        showHasViewed: val,
                      }))
                      clearTimeout(timerRef.current)
                      if (val) {
                        setViewedStatus('viewed')
                        timerRef.current = setTimeout(() => {
                          setViewedStatus(undefined)
                        }, 2000)
                      } else {
                        setViewedStatus(undefined)
                      }
                    }}
                  />
                </View>
              </View>
            </View>
            <View className={classNames('pl-4')} style={styles.layer1}>
              <View
                className={classNames(
                  'min-h-[52px] flex flex-row items-center',
                )}>
                <View className="flex-1">
                  <Text className="text-base" style={styles.text}>
                    帖子新回复提示
                  </Text>
                </View>
                <View className="mr-2 px-2">
                  <MySwitch
                    value={state.showHasNewReply}
                    onValueChange={(val) => {
                      setState((prev) => ({
                        ...prev,
                        showHasNewReply: val,
                      }))
                      clearTimeout(timerRef.current)
                      if (val) {
                        setViewedStatus('has_update')
                        timerRef.current = setTimeout(() => {
                          setViewedStatus(undefined)
                        }, 2000)
                      } else {
                        setViewedStatus(undefined)
                      }
                    }}
                  />
                </View>
              </View>
            </View>
          </GroupWapper>
          <SectionHeader title="内容刷新" />
          <GroupWapper>
            <View
              sentry-label="AutoRefrehLineItem"
              className={classNames('pl-4')}
              style={styles.layer1}>
              <View
                className={classNames(
                  'min-h-[52px] flex flex-row items-center',
                )}
                style={styles.border_b}>
                <View className="flex-1">
                  <Text className="text-base" style={styles.text}>
                    自动刷新
                  </Text>
                </View>
                <View className="mr-2 px-2">
                  <MySwitch
                    value={state.autoRefresh}
                    onValueChange={(val) =>
                      setState((prev) => ({
                        ...prev,
                        autoRefresh: val,
                      }))
                    }
                  />
                </View>
              </View>
            </View>

            <Pressable
              className={classNames('pl-4', 'active:opacity-50')}
              style={styles.layer1}
              onPress={() => {
                const index = refreshDurationOptions.findIndex(
                  (o) => o.value === state.autoRefreshDuration,
                )
                const nextIndex = (index + 1) % refreshDurationOptions.length
                const next = refreshDurationOptions[nextIndex]

                setState((prev) => ({
                  ...prev,
                  autoRefreshDuration: next.value,
                }))
              }}>
              <View
                className={classNames(
                  'min-h-[52px] flex flex-row items-center',
                )}
                style={styles.border_b}>
                <View className="flex-1">
                  <Text className="text-base" style={styles.text}>
                    刷新间隔
                  </Text>
                </View>
                <View className="mr-2 px-2">
                  <Text style={styles.text_desc}>
                    {state.autoRefreshDuration} 分钟
                  </Text>
                </View>
              </View>
            </Pressable>
            <View
              sentry-label="AutoRefrehLineItem"
              className={classNames('pl-4')}
              style={styles.layer1}>
              <View
                className={classNames(
                  'min-h-[52px] flex flex-row items-center',
                )}>
                <View className="flex-1">
                  <Text className="text-base" style={styles.text}>
                    震动反馈
                  </Text>
                </View>
                <View className="mr-2 px-2">
                  <MySwitch
                    value={state.refreshHaptics}
                    onValueChange={(val) =>
                      setState((prev) => ({
                        ...prev,
                        refreshHaptics: val,
                      }))
                    }
                  />
                </View>
              </View>
            </View>
          </GroupWapper>
          <SectionHeader title="其他" />
          <GroupWapper>
            <Pressable
              className={classNames('pl-4', 'active:opacity-50')}
              style={styles.layer1}
              onPress={() => {
                const index = searchProviderOptions.findIndex(
                  (o) => o.value === state.searchProvider,
                )
                const nextIndex = (index + 1) % searchProviderOptions.length
                const next = searchProviderOptions[nextIndex]

                setState((prev) => ({
                  ...prev,
                  searchProvider: next.value,
                }))
              }}>
              <View
                className={classNames(
                  'min-h-[52px] flex flex-row items-center',
                )}>
                <View className="flex-1">
                  <Text className="text-base" style={styles.text}>
                    搜索服务
                  </Text>
                </View>
                <View className="mr-2 px-2">
                  <Text style={styles.text_desc}>
                    {
                      searchProviderOptions.find(
                        (item) => item.value === state.searchProvider,
                      )?.label
                    }
                  </Text>
                </View>
              </View>
            </Pressable>
            <Pressable
              className={classNames('pl-4', 'active:opacity-50')}
              style={styles.layer1}
              onPress={() => {
                const index = historyRecordLimitOptions.findIndex((o) => {
                  return o.value === state.historyRecordLimit
                })
                const nextIndex = (index + 1) % historyRecordLimitOptions.length
                const next = historyRecordLimitOptions[nextIndex]
                setState((prev) => ({
                  ...prev,
                  historyRecordLimit: next.value,
                }))
              }}>
              <View
                className={classNames(
                  'min-h-[52px] flex flex-row items-center',
                )}>
                <View className="flex-1 flex flex-row items-center">
                  <Text className="text-base" style={styles.text}>
                    本地历史保留
                  </Text>
                  <View className="ml-1 mt-1">
                    <Text className="text-xs" style={styles.text_desc}>
                      自动清理过往记录
                    </Text>
                  </View>
                </View>
                <View className="mr-2 px-2">
                  <Text style={styles.text_desc}>
                    {
                      historyRecordLimitOptions.find(
                        (item) => item.value === state.historyRecordLimit,
                      )?.label
                    }
                  </Text>
                </View>
              </View>
            </Pressable>
          </GroupWapper>

          <SectionHeader title="布局" desc="修改此项时会重新启动应用" />
          <GroupWapper className="mb-8">
            <View
              sentry-label="AutoRefrehLineItem"
              className={classNames('pl-4')}
              style={styles.layer1}>
              <View
                className={classNames(
                  'min-h-[52px] flex flex-row items-center',
                )}>
                <View className="flex-1 flex flex-row items-center">
                  <Text className="text-base" style={styles.text}>
                    启用平板布局
                  </Text>
                  <View className="ml-1 mt-1">
                    <Text className="text-xs" style={styles.text_desc}>
                      窗口尺寸满足条件时生效
                    </Text>
                  </View>
                </View>
                <View className="mr-2 px-2">
                  <MySwitch
                    value={state.payLayoutEnabled}
                    onValueChange={(val) =>
                      setState((prev) => ({
                        ...prev,
                        payLayoutEnabled: val,
                      }))
                    }
                  />
                </View>
              </View>
            </View>
          </GroupWapper>
        </MaxWidthWrapper>
      </ScrollView>
    </SafeAreaView>
  )
}
