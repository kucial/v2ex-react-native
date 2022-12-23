import { useEffect, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Switch } from 'react-native'
import FastImage from 'react-native-fast-image'
import classNames from 'classnames'

import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'

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
  const { styles } = useTheme()
  return (
    <View
      className={classNames('flex flex-row items-center')}
      style={[styles.layer1, styles.border_b, styles.border_light]}>
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
            <View
              className="py-[2px] px-[6px] rounded active:opacity-60"
              style={styles.layer2}>
              <Text className="text-xs" style={styles.text_desc}>
                {node.title}
              </Text>
            </View>
          </View>
          <Text style={styles.text_meta}>·</Text>
          <View className="relative top-[1px]">
            <Text className="font-bold text-xs" style={styles.text_desc}>
              {member.username}
            </Text>
          </View>
        </View>
        <View>
          <Text className="text-base" style={styles.text}>
            {title}
          </Text>
          <View className="mt-2 flex flex-row items-center">
            <Text className="text-xs" style={styles.text_meta}>
              {last_reply_time}
            </Text>
            {showLastReplyMember && (
              <>
                <Text className="text-xs px-2" style={styles.text_meta}>
                  •
                </Text>
                <View className="flex flex-row items-center">
                  <Text className="text-xs" style={styles.text_meta}>
                    最后回复来自
                  </Text>
                  <View className="px-1 active:opacity-60" hitSlop={4}>
                    <Text
                      className="text-xs font-bold"
                      style={styles.text_desc}>
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
          <View className="rounded-full px-2" style={styles.tag.bg}>
            <Text style={styles.tag.text}>{replies}</Text>
          </View>
        )}
      </View>
    </View>
  )
}
const TideTopicRowDemo = (props) => {
  const { styles } = useTheme()
  const { node, member, title, replies, last_reply_time, last_reply_by } =
    props.data
  const { showAvatar, showLastReplyMember } = props
  return (
    <View
      className={classNames('flex flex-row items-center')}
      style={[styles.layer1, styles.border_b, styles.border_light]}>
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
          <Text className="text-base leading-[22px]" style={styles.text}>
            {title}
          </Text>
          <View className="mt-1 flex flex-row items-center">
            <View
              className="py-[2px] px-[6px] mr-2 rounded active:opacity-60"
              style={styles.layer2}>
              <Text className="text-xs" style={styles.text_desc}>
                {node.title}
              </Text>
            </View>
            <Text className="text-xs" style={styles.text_meta}>
              {last_reply_time}
            </Text>
            {showLastReplyMember && (
              <>
                <Text className="text-xs px-1" style={styles.text_meta}>
                  •
                </Text>
                <View className="flex flex-row items-center">
                  <Text className="text-xs" style={styles.text_meta}>
                    最后回复来自
                  </Text>
                  <View className="px-1 active:opacity-60" hitSlop={4}>
                    <Text
                      className="text-xs font-bold"
                      style={styles.text_desc}>
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
        <View className="rounded-full px-1" style={styles.tag.bg}>
          <Text className="text-xs" style={styles.tag.text}>
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
  const { styles } = useTheme()

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
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
