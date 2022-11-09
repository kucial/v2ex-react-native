import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Switch } from 'react-native'
import FastImage from 'react-native-fast-image'
import classNames from 'classnames'

import { useAppSettings } from '@/containers/AppSettingsService'

const styleLabels = {
  normal: '默认',
  tide: '紧凑',
}

const topic = {
  member: {
    avatar_mini:
      'https://cdn.v2ex.com/avatar/c4ca/4238/1_xlarge.png?m=1657258945',
    username: 'livid',
  },
  node: {
    name: 'v2ex',
    title: 'V2EX',
  },
  last_reply_by: 'kongkx',
  last_reply_time: '2小时18分钟前',
  title:
    '如果你在 V2EX 设置的个人网站地址那里填的是一个 ENS，现在会显示 ENS 的图标',
  replies: 200,
}

const refreshDurationOptions = [
  { value: 5, label: '5 分钟' },
  { value: 10, label: '10 分钟' },
  { value: 15, label: '15 分钟' },
  { value: 30, label: '30 分钟' },
]

const NormalTopicRowDemo = (props) => {
  const { node, member, title, replies, last_reply_time, last_reply_by } =
    props.data
  const { showAvatar, showLastReplyMember } = props
  return (
    <View
      className={classNames(
        'border-b flex flex-row items-center active:opacity-50',
        'border-neutral-300 bg-white',
        'dark:border-neutral-700 dark:bg-neutral-900',
      )}>
      {showAvatar ? (
        <View className="px-2 py-2 self-start">
          <FastImage
            source={{
              uri: member.avatar_mini,
            }}
            className="w-[24px] h-[24px] rounded"
          />
        </View>
      ) : (
        <View className="pl-3"></View>
      )}
      <View className={classNames('flex-1 py-2')}>
        <View className="flex flex-row items-center pt-[2px] space-x-1 mb-1">
          <View>
            <View className="py-[2px] px-[6px] rounded bg-neutral-100 active:opacity-60 dark:bg-neutral-750">
              <Text className="text-xs text-neutral-500 dark:text-neutral-300">
                {node.title}
              </Text>
            </View>
          </View>
          <Text className="text-neutral-400 dark:text-neutral-300">·</Text>
          <View className="relative top-[1px]">
            <Text className="font-bold text-xs text-neutral-700 dark:text-neutral-300">
              {member.username}
            </Text>
          </View>
        </View>
        <View>
          <Text className="text-base text-neutral-700 dark:text-neutral-300">
            {title}
          </Text>
          <View className="mt-2 flex flex-row items-center">
            <Text className="text-xs text-neutral-400">{last_reply_time}</Text>
            {showLastReplyMember && (
              <>
                <Text className="text-neutral-400 text-xs px-2">•</Text>
                <View className="flex flex-row items-center">
                  <Text className="text-xs text-neutral-400 dark:text-neutral-300">
                    最后回复来自
                  </Text>
                  <View className="px-1 active:opacity-60" hitSlop={4}>
                    <Text className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      {last_reply_by}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
      <View className="w-[80px] flex flex-row justify-end pr-4">
        {!!replies && (
          <View className="rounded-full text-xs px-2 bg-neutral-400 dark:bg-neutral-600">
            <Text className="text-white dark:text-neutral-300">{replies}</Text>
          </View>
        )}
      </View>
    </View>
  )
}
const TideTopicRowDemo = (props) => {
  const { node, member, title, replies, last_reply_time, last_reply_by } =
    props.data
  const { showAvatar, showLastReplyMember } = props
  return (
    <View
      className={classNames(
        'border-b flex flex-row items-center active:opacity-50',
        'border-neutral-300 bg-white',
        'dark:border-neutral-700 dark:bg-neutral-900',
      )}>
      {showAvatar ? (
        <View className="px-2 py-2 self-start">
          <FastImage
            source={{
              uri: member.avatar_mini,
            }}
            className="w-[24px] h-[24px] rounded"
          />
        </View>
      ) : (
        <View className="pl-3"></View>
      )}

      <View className={classNames('flex-1 pt-1 pb-2')}>
        <View>
          <Text className="text-[16px] leading-[22px] text-neutral-700 dark:text-neutral-300">
            {title}
          </Text>
          <View className="mt-1 flex flex-row items-center">
            <View className="py-[2px] px-[6px] mr-2 rounded bg-neutral-100 active:opacity-60 dark:bg-neutral-750">
              <Text className="text-xs text-neutral-500 dark:text-neutral-300">
                {node.title}
              </Text>
            </View>
            <Text className="text-xs text-neutral-400">{last_reply_time}</Text>
            {showLastReplyMember && (
              <>
                <Text className="text-neutral-400 text-xs px-1">•</Text>
                <View className="flex flex-row items-center">
                  <Text className="text-xs text-neutral-400 dark:text-neutral-300">
                    最后回复来自
                  </Text>
                  <View className="px-1 active:opacity-60" hitSlop={4}>
                    <Text className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      {last_reply_by}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
      <View className="flex flex-row justify-end pl-1 pr-2">
        <View className="rounded-full px-1 bg-neutral-400 dark:bg-neutral-600">
          <Text className="text-white text-xs dark:text-neutral-300">
            {replies}
          </Text>
        </View>
      </View>
    </View>
  )
}

export function PreferenceSettings({ navigation }) {
  const { data, update } = useAppSettings()
  const [state, setState] = useState(data)

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (state !== data) {
        update(state)
      }
    })
    return unsubscribe
  }, [navigation, data, state])

  return (
    <View className="flex-1 bg-white dark:bg-neutral-900">
      <View className="mt-2">
        <View className="px-4 py-2 border-b border-neutral-300 dark:border-neutral-700">
          <Text className="text-lg font-medium dark:text-neutral-300">
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
          className={classNames(
            'pl-4',
            'bg-white dark:bg-neutral-900',
            'active:opacity-50',
          )}
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
              'border-b border-neutral-300 dark:border-neutral-700',
            )}>
            <View className="flex-1">
              <Text className="text-base dark:text-neutral-300">列表布局</Text>
            </View>
            <View className="mr-4 px-2">
              <Text className="text-neutral-700 dark:text-neutral-400">
                {styleLabels[state.feedLayout]}
              </Text>
            </View>
          </View>
        </Pressable>
        <View className={classNames('pl-4', 'bg-white dark:bg-neutral-900')}>
          <View
            className={classNames(
              'min-h-[52px] flex flex-row items-center',
              'border-b border-neutral-300 dark:border-neutral-700',
            )}>
            <View className="flex-1">
              <Text className="text-base dark:text-neutral-300">显示头像</Text>
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
        <View className={classNames('pl-4', 'bg-white dark:bg-neutral-900')}>
          <View
            className={classNames(
              'min-h-[52px] flex flex-row items-center',
              'border-b border-neutral-300 dark:border-neutral-700',
            )}>
            <View className="flex-1">
              <Text className="text-base dark:text-neutral-300">
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
        <View className={classNames('pl-4', 'bg-white dark:bg-neutral-900')}>
          <View
            className={classNames(
              'min-h-[52px] flex flex-row items-center',
              'border-b border-neutral-300 dark:border-neutral-700',
            )}>
            <View className="flex-1">
              <Text className="text-base dark:text-neutral-300">已读提示</Text>
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
        <View className="px-4 py-2 border-b border-neutral-300 dark:border-neutral-700">
          <Text className="text-lg font-medium dark:text-neutral-300">
            刷新
          </Text>
        </View>

        <View
          sentry-label="AutoRefrehLineItem"
          className={classNames('pl-4', 'bg-white dark:bg-neutral-900')}>
          <View
            className={classNames(
              'min-h-[52px] flex flex-row items-center',
              'border-b border-neutral-300 dark:border-neutral-700',
            )}>
            <View className="flex-1">
              <Text className="text-base dark:text-neutral-300">自动刷新</Text>
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
          className={classNames(
            'pl-4',
            'bg-white dark:bg-neutral-900',
            'active:opacity-50',
          )}
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
              'border-b border-neutral-300 dark:border-neutral-700',
            )}>
            <View className="flex-1">
              <Text className="text-base dark:text-neutral-300">刷新间隔</Text>
            </View>
            <View className="mr-2 px-2">
              <Text className="text-neutral-700 dark:text-neutral-400">
                {state.autoRefreshDuration} 分钟
              </Text>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  )
}
