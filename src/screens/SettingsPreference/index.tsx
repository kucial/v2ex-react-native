import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Switch } from 'react-native'
import classNames from 'classnames'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'

import { topic } from './mock'
import NormalTopicRowDemo from './NormalTopicRowDemo'
import TideTopicRowDemo from './TideTopicRowDemo'

const styleLabels = {
  normal: '默认',
  tide: '紧凑',
}

const refreshDurationOptions = [
  { value: 5, label: '5 分钟' },
  { value: 10, label: '10 分钟' },
  { value: 15, label: '15 分钟' },
  { value: 30, label: '30 分钟' },
]

type ScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'preference-settings'
>
export default function PreferenceSettings({ navigation }: ScreenProps) {
  const { data, update } = useAppSettings()
  const [state, setState] = useState(data)
  const { styles } = useTheme()

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (state !== data) {
        update(state)
      }
    })
    return unsubscribe
  }, [navigation, data, state])

  return (
    <View className="flex-1" style={styles.layer1}>
      <View className="mt-2">
        <View className="px-4 py-2" style={[styles.border_b]}>
          <Text className="text-lg font-medium" style={styles.text}>
            显示
          </Text>
        </View>

        <View className="">
          {state.feedLayout === 'normal' && (
            <NormalTopicRowDemo
              data={topic}
              showAvatar={state.feedShowAvatar}
              showLastReplyMember={state.feedShowLastReplyMember}
            />
          )}
          {state.feedLayout === 'tide' && (
            <TideTopicRowDemo
              data={topic}
              showAvatar={state.feedShowAvatar}
              showLastReplyMember={state.feedShowLastReplyMember}
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
            className={classNames('min-h-[52px] flex flex-row items-center')}
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
        <View className={classNames('pl-4')} style={styles.layer1}>
          <View
            className={classNames('min-h-[52px] flex flex-row items-center')}
            style={styles.border_b}>
            <View className="flex-1">
              <Text className="text-base" style={styles.text}>
                显示头像
              </Text>
            </View>
            <View className="mr-2 px-2">
              <Switch
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
            className={classNames('min-h-[52px] flex flex-row items-center')}
            style={styles.border_b}>
            <View className="flex-1">
              <Text className="text-base" style={styles.text}>
                显示最后回复用户
              </Text>
            </View>
            <View className="mr-2 px-2">
              <Switch
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
            className={classNames('min-h-[52px] flex flex-row items-center')}
            style={styles.border_b}>
            <View className="flex-1">
              <Text className="text-base" style={styles.text}>
                已读提示
              </Text>
            </View>
            <View className="mr-2 px-2">
              <Switch
                value={state.showHasViewed}
                onValueChange={(val) =>
                  setState((prev) => ({
                    ...prev,
                    showHasViewed: val,
                  }))
                }
              />
            </View>
          </View>
        </View>
      </View>
      <View className="mt-4">
        <View className="px-4 py-2" style={styles.border_b}>
          <Text className="text-lg font-medium" style={styles.text}>
            内容刷新
          </Text>
        </View>

        <View
          sentry-label="AutoRefrehLineItem"
          className={classNames('pl-4')}
          style={styles.layer1}>
          <View
            className={classNames('min-h-[52px] flex flex-row items-center')}
            style={styles.border_b}>
            <View className="flex-1">
              <Text className="text-base" style={styles.text}>
                自动刷新
              </Text>
            </View>
            <View className="mr-2 px-2">
              <Switch
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
            className={classNames('min-h-[52px] flex flex-row items-center')}
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
      </View>
    </View>
  )
}
