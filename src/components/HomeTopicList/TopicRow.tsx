import { Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import classNames from 'classnames'

import FixedPressable from '@/components/FixedPressable'
import { BlockText, Box, InlineText } from '@/components/Skeleton/Elements'
import TriangleCorner from '@/components/TriangleCorner'
import { useTheme } from '@/containers/ThemeService'

export default function TopicRow(props: HomeFeedRowProps) {
  const { data, showAvatar, showLastReplyMember } = props
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { styles } = useTheme()

  if (!data) {
    return (
      <View
        className={classNames('flex flex-row items-center')}
        style={[styles.layer1, styles.border_b, styles.border_light]}>
        <View className="flex-1 py-2 pl-1">
          <View className="flex flex-row items-center space-x-2 pl-1 mb-1">
            {showAvatar && <Box className="w-[24px] h-[24px] rounded" />}
            <View>
              <View className="py-[2px] rounded w-[50px]">
                <InlineText className="text-xs"></InlineText>
              </View>
            </View>
            <Text style={styles.text_meta}>·</Text>
            <View className="relative">
              <InlineText width={[56, 80]} className="text-xs"></InlineText>
            </View>
          </View>
          <View className="pl-[34px]">
            <BlockText
              randomWidth
              lines={[1, 3]}
              className="text-base"></BlockText>
            <View className="mt-2">
              <InlineText width={[80, 120]} className="text-xs"></InlineText>
            </View>
          </View>
        </View>
        <View className="w-[80px] flex flex-row justify-end pr-4">
          <Box className="rounded-full px-2">
            <InlineText width={8} className="text-xs" />
          </Box>
        </View>
      </View>
    )
  }

  const { node, member, title, replies } = props.data

  return (
    <FixedPressable
      sentry-label="TopicRow"
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
              source={{
                uri: member.avatar_normal,
              }}
              className="w-[24px] h-[24px] rounded"
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
        <View className="flex flex-row items-center pt-[2px] space-x-1 mb-1">
          <View>
            <FixedPressable
              hitSlop={4}
              className="py-[2px] px-[6px] rounded active:opacity-60"
              style={styles.layer2}
              onPress={() => {
                navigation.navigate('node', {
                  name: node.name,
                  brief: node,
                })
              }}>
              <Text className="text-xs" style={styles.text_desc}>
                {node.title}
              </Text>
            </FixedPressable>
          </View>
          <Text style={styles.text_meta}>·</Text>
          <View className="relative top-[1px]">
            <FixedPressable
              className="active:opacity-60"
              hitSlop={5}
              onPress={() => {
                navigation.navigate('member', {
                  username: member.username,
                  brief: member,
                })
              }}>
              <Text className="font-bold text-xs" style={styles.text_desc}>
                {member.username}
              </Text>
            </FixedPressable>
          </View>
        </View>
        <View>
          <Text className="text-base" style={styles.text}>
            {title}
          </Text>
          <View className="mt-2 flex flex-row items-center">
            <Text className="text-xs" style={styles.text_meta}>
              {data?.last_reply_time}
            </Text>
            {showLastReplyMember && data?.last_reply_by && (
              <>
                <Text className="text-xs px-2" style={styles.text_meta}>
                  •
                </Text>
                <View className="flex flex-row items-center">
                  <Text className="text-xs" style={styles.text_meta}>
                    最后回复来自
                  </Text>
                  <FixedPressable
                    className="px-1 active:opacity-60"
                    hitSlop={4}
                    onPress={() => {
                      navigation.push('member', {
                        username: data.last_reply_by,
                        tab: 'replies',
                      })
                    }}>
                    <Text
                      className="text-xs font-bold"
                      style={styles.text_desc}>
                      {data.last_reply_by}
                    </Text>
                  </FixedPressable>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
      <View className="w-[80px] flex flex-row justify-end pr-4">
        <View className="relative">
          {!!replies && (
            <View className="rounded-full text-xs px-2" style={styles.tag__bg}>
              <Text style={styles.tag__text}>{replies}</Text>
            </View>
          )}
        </View>
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
  )
}
