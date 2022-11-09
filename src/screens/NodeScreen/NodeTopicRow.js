import { memo } from 'react'
import { Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native'
import classNames from 'classnames'

import FixedPressable from '@/components/FixedPressable'
import {
  BlockText,
  Box,
  InlineBox,
  InlineText,
} from '@/components/Skeleton/Elements'

function NodeTopicRow(props) {
  const navigation = useNavigation()
  const { data, showAvatar } = props

  if (!data) {
    return (
      <View
        className={classNames(
          'border-b flex flex-row items-center',
          'border-neutral-200 bg-white',
          'dark:border-neutral-700 dark:bg-neutral-900',
        )}>
        {showAvatar ? (
          <View className="px-2 py-2 self-start">
            <InlineBox className="w-[24px] h-[24px] rounded" />
          </View>
        ) : (
          <View className="pl-3"></View>
        )}
        <View className="flex-1 py-2">
          <BlockText className="text-base" lines={[1, 3]} />
          <View className="mt-2 flex flex-row space-x-1">
            <InlineText className="text-xs" width={[58, 80]} />
          </View>
        </View>

        <View className="w-[80px] flex flex-row items-center justify-end pr-2">
          <Box className="rounded-full px-2">
            <InlineText width={8} className="text-xs" />
          </Box>
        </View>
      </View>
    )
  }

  const { member } = data

  return (
    <FixedPressable
      className={classNames(
        'border-b flex flex-row items-center active:opacity-50',
        'border-neutral-200 bg-white',
        'dark:border-neutral-700 dark:bg-neutral-900',
      )}
      onPress={() => {
        navigation.push('topic', {
          id: props.data.id,
          brief: props.data,
        })
      }}>
      {showAvatar ? (
        <View className="px-2 py-2 self-start">
          <FixedPressable
            onPress={() => {
              navigation.navigate('member', {
                username: member.username,
                brief: member,
              })
            }}>
            <FastImage
              className="w-[24px] h-[24px] rounded"
              source={{
                uri: member.avatar_normal,
                priority: FastImage.priority.low,
              }}
            />
          </FixedPressable>
        </View>
      ) : (
        <View className="pl-3"></View>
      )}

      <View className={classNames('flex-1 py-2', props.viewed && 'opacity-70')}>
        <Text className="text-base text-neutral-700 dark:text-neutral-300">
          {data.title}
        </Text>
        <View className="mt-2 flex flex-row">
          <Text className="text-xs font-semibold text-neutral-400">
            {member.username}
          </Text>
          {!!data.characters && (
            <>
              <Text className="text-xs text-neutral-400 px-1">·</Text>
              <Text className="text-xs text-neutral-400">
                {data.characters} 字符
              </Text>
            </>
          )}
          {!!data.clicks && (
            <>
              <Text className="text-xs text-neutral-400 px-1">·</Text>
              <Text className="text-xs text-neutral-400">
                {data.clicks} 次点击
              </Text>
            </>
          )}
        </View>
      </View>

      <View className="w-[80px] flex flex-row items-center justify-end pr-2">
        {!!data.replies && (
          <View className="rounded-full text-xs px-2 bg-neutral-400 dark:bg-neutral-600">
            <Text className="text-white dark:text-neutral-300">
              {data.replies}
            </Text>
          </View>
        )}
      </View>
    </FixedPressable>
  )
}
export default memo(NodeTopicRow)
