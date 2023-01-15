import { memo } from 'react'
import { Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native'
import classNames from 'classnames'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import FixedPressable from '@/components/FixedPressable'
import {
  BlockText,
  Box,
  InlineBox,
  InlineText,
} from '@/components/Skeleton/Elements'
import { useTheme } from '@/containers/ThemeService'

function NodeTopicRow(props: NodeFeedRowProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { styles } = useTheme()
  const { data, showAvatar } = props

  if (!data) {
    return (
      <View
        className={classNames('flex flex-row items-center')}
        style={[styles.layer1, styles.border_b, styles.border_light]}>
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
      className={classNames('flex flex-row items-center', 'active:opacity-50')}
      style={[styles.layer1, styles.border_b, styles.border_light]}
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
        <Text className="text-base" style={styles.text}>
          {data.title}
        </Text>
        <View className="mt-2 flex flex-row">
          <Text className="text-xs font-semibold" style={styles.text_desc}>
            {member.username}
          </Text>
          {!!data.characters && (
            <>
              <Text className="text-xs px-1" style={styles.text_meta}>
                ·
              </Text>
              <Text className="text-xs" style={styles.text_meta}>
                {data.characters} 字符
              </Text>
            </>
          )}
          {!!data.clicks && (
            <>
              <Text className="text-xs px-1" style={styles.text_meta}>
                ·
              </Text>
              <Text className="text-xs" style={styles.text_meta}>
                {data.clicks} 次点击
              </Text>
            </>
          )}
        </View>
      </View>

      <View className="w-[80px] flex flex-row items-center justify-end pr-2">
        {!!data.replies && (
          <View className="rounded-full px-2" style={styles.tag__bg}>
            <Text style={styles.tag__text}>{data.replies}</Text>
          </View>
        )}
      </View>
    </FixedPressable>
  )
}
export default memo(NodeTopicRow)
