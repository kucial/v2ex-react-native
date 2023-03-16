import { memo } from 'react'
import { Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import classNames from 'classnames'
import { Image } from 'expo-image'

import FixedPressable from '@/components/FixedPressable'
import {
  BlockText,
  Box,
  InlineBox,
  InlineText,
} from '@/components/Skeleton/Elements'
import TriangleCorner from '@/components/TriangleCorner'
import { useTheme } from '@/containers/ThemeService'

import MaxWidthWrapper from '../MaxWidthWrapper'

function NodeTopicRow(props: NodeFeedRowProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { styles } = useTheme()
  const { data, showAvatar, isLast } = props

  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View
          className={classNames('flex flex-row items-center')}
          style={!isLast && styles.border_b_light}>
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
      </MaxWidthWrapper>
    )
  }

  const { member } = data

  return (
    <MaxWidthWrapper style={styles.layer1}>
      <FixedPressable
        className={classNames(
          'flex flex-row items-center',
          'active:opacity-50',
        )}
        style={!isLast && styles.border_b_light}
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
              <Image
                recyclingKey={`user-avatar:${member.username}`}
                className="w-[24px] h-[24px] rounded"
                source={{
                  uri: member.avatar_normal,
                }}
                priority="low"
              />
            </FixedPressable>
          </View>
        ) : (
          <View className="pl-3"></View>
        )}

        <View
          className={classNames(
            'flex-1 py-2',
            props.viewedStatus === 'viewed' && 'opacity-70',
          )}>
          <Text
            className={classNames('text-base', {
              'font-[500]': props.titleStyle === 'emphasized',
            })}
            style={styles.text}>
            {data.title}
          </Text>
          <View className="mt-2 flex flex-row">
            <Text className="text-xs font-[600]" style={styles.text_desc}>
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

        {props.viewedStatus === 'has_update' && (
          <TriangleCorner
            corner="top-left"
            size={10}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              opacity: 0.9,
            }}
          />
        )}
      </FixedPressable>
    </MaxWidthWrapper>
  )
}
export default memo(NodeTopicRow)
