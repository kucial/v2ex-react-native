import { useEffect, useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import RNRestart from 'react-native-restart'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { EventArg } from '@react-navigation/native'
import { useNavigation } from 'expo-router'

import GroupWapper from '@/components/GroupWrapper'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import MySwitch from '@/components/MySwitch'
import NavigationHeader from '@/components/NavigationHeader'
import SectionHeader from '@/components/SectionHeader'

import { useAppSettings } from '@/containers/AppSettingsService'
import {
  FeedLayoutStyle,
  FeedTitleStyle,
  SearchProvider,
} from '@/containers/AppSettingsService/types'
import { useTheme } from '@/containers/ThemeService'

import { topic } from './mock'
import NormalTopicRowDemo from './NormalTopicRowDemo'
import TideTopicRowDemo from './TideTopicRowDemo'
import { DemoRowProps } from './types'

const feedLayoutOptions: {
  value: FeedLayoutStyle
  label: string
}[] = [
  { value: 'normal', label: '默认' },
  { value: 'tide', label: '紧凑' },
]

const titleStyleOptions: {
  value: FeedTitleStyle
  label: string
}[] = [
  { value: 'normal', label: '默认' },
  { value: 'emphasized', label: '强调' },
]
const refreshDurationOptions = [
  { value: 5, label: '5 分钟' },
  { value: 10, label: '10 分钟' },
  { value: 15, label: '15 分钟' },
  { value: 30, label: '30 分钟' },
]

const searchProviderOptions: {
  value: SearchProvider
  label: string
}[] = [
  { value: 'google', label: 'Google' },
  { value: 'sov2ex', label: 'sov2ex' },
]

const historyRecordLimitOptions: {
  value: number | null
  label: string
}[] = [
  { value: 100, label: '100条' },
  { value: 300, label: '300条' },
  { value: 500, label: '500条' },
  { value: null, label: '不限' },
]

export default function PreferenceSettings() {
  const { data, update } = useAppSettings()
  const [state, setState] = useState(data)
  const [viewedStatus, setViewedStatus] =
    useState<DemoRowProps['viewedStatus']>(undefined)
  const { styles, colorScheme } = useTheme()
  const navigation = useNavigation()

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      'beforeRemove',
      (e: EventArg<'beforeRemove', true>) => {
        if (state !== data) {
          if (state.payLayoutEnabled !== data.payLayoutEnabled) {
            e.preventDefault()
            update(state)
            RNRestart.Restart()
          } else {
            update(state)
          }
        }
      },
    )
    return unsubscribe
  }, [navigation, data, state, update])

  const timerRef = useRef(null)
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <View style={prefStyles.container}>
      <NavigationHeader canGoBack title='功能设置' />
      <ScrollView style={prefStyles.scrollView}>
        <MaxWidthWrapper>
          <SectionHeader title='显示' />
          <GroupWapper>
            <View>
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

            <View style={[prefStyles.rowWrap, styles.layer1]}>
              <View style={[prefStyles.rowContent, styles.border_b]}>
                <View style={prefStyles.flex1}>
                  <Text style={[styles.text, styles.text_base]}>列表布局</Text>
                </View>
                <View style={prefStyles.controlWrap}>
                  <SegmentedControl
                    values={feedLayoutOptions.map((o) => o.label)}
                    selectedIndex={feedLayoutOptions.findIndex(
                      (o) => o.value === state.feedLayout,
                    )}
                    onChange={(event) => {
                      const value =
                        feedLayoutOptions[
                          event.nativeEvent.selectedSegmentIndex
                        ].value
                      setState((prev) => ({
                        ...prev,
                        feedLayout: value,
                      }))
                    }}
                    appearance={colorScheme}
                  />
                </View>
              </View>
            </View>
            <View style={[prefStyles.rowWrap, styles.layer1]}>
              <View style={[prefStyles.rowContent, styles.border_b]}>
                <View style={prefStyles.flex1}>
                  <Text style={[styles.text, styles.text_base]}>标题样式</Text>
                </View>
                <View style={prefStyles.controlWrap}>
                  <SegmentedControl
                    values={titleStyleOptions.map((o) => o.label)}
                    selectedIndex={titleStyleOptions.findIndex(
                      (o) => o.value === state.feedTitleStyle,
                    )}
                    onChange={(event) => {
                      const value =
                        titleStyleOptions[
                          event.nativeEvent.selectedSegmentIndex
                        ].value
                      setState((prev) => ({
                        ...prev,
                        feedTitleStyle: value,
                      }))
                    }}
                    appearance={colorScheme}
                  />
                </View>
              </View>
            </View>
            <View style={[prefStyles.rowWrap, styles.layer1]}>
              <View style={[prefStyles.rowContent, styles.border_b]}>
                <View style={prefStyles.flex1}>
                  <Text style={[styles.text, styles.text_base]}>显示头像</Text>
                </View>
                <View style={prefStyles.switchWrap}>
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
            <View style={[prefStyles.rowWrap, styles.layer1]}>
              <View style={[prefStyles.rowContent, styles.border_b]}>
                <View style={prefStyles.flex1}>
                  <Text style={[styles.text, styles.text_base]}>
                    显示最后回复用户
                  </Text>
                </View>
                <View style={prefStyles.switchWrap}>
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
            <View style={[prefStyles.rowWrap, styles.layer1]}>
              <View style={[prefStyles.rowContent, styles.border_b]}>
                <View style={prefStyles.flex1}>
                  <Text style={[styles.text, styles.text_base]}>已读提示</Text>
                </View>
                <View style={prefStyles.switchWrap}>
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
            <View style={[prefStyles.rowWrap, styles.layer1]}>
              <View style={prefStyles.rowContent}>
                <View style={prefStyles.flex1}>
                  <Text style={[styles.text, styles.text_base]}>
                    帖子新回复提示
                  </Text>
                </View>
                <View style={prefStyles.switchWrap}>
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
          <SectionHeader title='内容刷新' />
          <GroupWapper>
            <View
              sentry-label='AutoRefrehLineItem'
              style={[prefStyles.rowWrap, styles.layer1]}
            >
              <View style={[prefStyles.rowContent, styles.border_b]}>
                <View style={prefStyles.flex1}>
                  <Text style={[styles.text, styles.text_base]}>自动刷新</Text>
                </View>
                <View style={prefStyles.switchWrap}>
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
              style={({ pressed }) => [
                prefStyles.rowWrap,
                styles.layer1,
                pressed && prefStyles.pressed50,
              ]}
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
              }}
            >
              <View style={[prefStyles.rowContent, styles.border_b]}>
                <View style={prefStyles.flex1}>
                  <Text style={[styles.text, styles.text_base]}>刷新间隔</Text>
                </View>
                <View style={prefStyles.switchWrap}>
                  <Text style={styles.text_desc}>
                    {state.autoRefreshDuration} 分钟
                  </Text>
                </View>
              </View>
            </Pressable>
            <View
              sentry-label='AutoRefrehLineItem'
              style={[prefStyles.rowWrap, styles.layer1]}
            >
              <View style={prefStyles.rowContent}>
                <View style={prefStyles.flex1}>
                  <Text style={[styles.text, styles.text_base]}>震动反馈</Text>
                </View>
                <View style={prefStyles.switchWrap}>
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
          <SectionHeader title='其他' />
          <GroupWapper>
            <View style={[prefStyles.rowWrap, styles.layer1]}>
              <View style={[prefStyles.rowContent, styles.border_b]}>
                <View style={prefStyles.flex1}>
                  <Text style={[styles.text, styles.text_base]}>搜索服务</Text>
                </View>
                <View style={prefStyles.controlWrap}>
                  <SegmentedControl
                    values={searchProviderOptions.map((o) => o.label)}
                    selectedIndex={searchProviderOptions.findIndex(
                      (o) => o.value === state.searchProvider,
                    )}
                    onChange={(event) => {
                      const value =
                        searchProviderOptions[
                          event.nativeEvent.selectedSegmentIndex
                        ].value
                      setState((prev) => ({
                        ...prev,
                        searchProvider: value,
                      }))
                    }}
                    appearance={colorScheme}
                  />
                </View>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [
                prefStyles.rowWrap,
                styles.layer1,
                pressed && prefStyles.pressed50,
              ]}
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
              }}
            >
              <View style={prefStyles.rowContent}>
                <View style={prefStyles.titleRow}>
                  <Text style={[styles.text, styles.text_base]}>
                    本地历史保留
                  </Text>
                  <View style={prefStyles.descWrap}>
                    <Text style={[styles.text_desc, styles.text_xs]}>
                      自动清理过往记录
                    </Text>
                  </View>
                </View>
                <View style={prefStyles.switchWrap}>
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
            <View
              sentry-label='AutoRefrehLineItem'
              style={[prefStyles.rowWrap, styles.layer1]}
            >
              <View style={prefStyles.rowContent}>
                <View style={prefStyles.titleRow}>
                  <Text style={[styles.text, styles.text_base]}>
                    启用多用户回复
                  </Text>
                  <View style={prefStyles.descWrap}>
                    <Text style={[styles.text_desc, styles.text_xs]}>
                      一次回复多个用户
                    </Text>
                  </View>
                </View>
                <View style={prefStyles.switchWrap}>
                  <MySwitch
                    value={state.enableMultiMention}
                    onValueChange={(val) =>
                      setState((prev) => ({
                        ...prev,
                        enableMultiMention: val,
                      }))
                    }
                  />
                </View>
              </View>
            </View>
          </GroupWapper>

          <SectionHeader title='布局' desc='修改此项时会重新启动应用' />
          <GroupWapper style={prefStyles.mb8}>
            <View
              sentry-label='AutoRefrehLineItem'
              style={[prefStyles.rowWrap, styles.layer1]}
            >
              <View style={prefStyles.rowContent}>
                <View style={prefStyles.titleRow}>
                  <Text style={[styles.text, styles.text_base]}>
                    启用平板布局
                  </Text>
                </View>
                <View style={prefStyles.switchWrap}>
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
    </View>
  )
}

const prefStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 8,
  },
  rowWrap: {
    paddingLeft: 16,
  },
  rowContent: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  controlWrap: {
    width: 140,
    marginRight: 4,
    paddingHorizontal: 8,
  },
  switchWrap: {
    marginRight: 8,
    paddingHorizontal: 8,
  },
  pressed50: {
    opacity: 0.5,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  descWrap: {
    marginLeft: 4,
    marginTop: 4,
  },
  mb8: {
    marginBottom: 32,
  },
})
