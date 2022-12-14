import { Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native'
import classNames from 'classnames'

import FixedPressable from '@/components/FixedPressable'
import { BlockText, Box, InlineText } from '@/components/Skeleton/Elements'
import { useTheme } from '@/containers/ThemeService'

export default function TideTopicRow(props) {
  const { data, showAvatar, showLastReplyMember } = props
  const navigation = useNavigation()
  const { styles } = useTheme()

  if (!data) {
    return (
      <View
        className={classNames('flex flex-row items-center')}
        style={[styles.layer1, styles.border_b, styles.border_light]}>
        {showAvatar ? (
          <View className="px-2 py-2 self-start">
            <Box className="w-[24px] h-[24px] rounded" />
          </View>
        ) : (
          <View className="pl-3"></View>
        )}
        <View className="flex-1 pt-1 pb-2">
          <BlockText
            randomWidth
            lines={[1, 2]}
            className="text-[16px] leading-[22px]"></BlockText>
          <View className="mt-1">
            <InlineText width={[80, 120]} className="text-xs"></InlineText>
          </View>
        </View>
        <View className="flex flex-row justify-end pl-1 pr-2">
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
      sentry-label="TideTopicRow"
      className={classNames('flex flex-row items-center active:opacity-50')}
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
                uri: member.avatar_mini,
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
          'flex-1 pt-1 pb-2',
          props.viewed && 'opacity-70',
        )}>
        <Text className="text-[16px] leading-[22px]" style={styles.text}>
          {title}
        </Text>
        <View className="mt-1 flex flex-row flex-wrap items-center">
          <FixedPressable
            hitSlop={4}
            className="py-[2px] px-[6px] mr-[6px] rounded active:opacity-60"
            style={[styles.layer2]}
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
          {!showLastReplyMember && data?.last_reply_time && (
            <View className="mr-1">
              <Text className="text-xs" style={styles.text_meta}>
                ????????????
              </Text>
            </View>
          )}
          <Text className="text-xs" style={styles.text_meta}>
            {data?.last_reply_time}
          </Text>
          {showLastReplyMember && data?.last_reply_by && (
            <>
              <Text className="text-xs px-1" style={styles.text_meta}>
                ???
              </Text>
              <View className="flex flex-row items-center">
                <Text className="text-xs" style={styles.text_meta}>
                  ??????????????????
                </Text>
                <FixedPressable
                  className="px-1 active:opacity-60"
                  hitSlop={4}
                  onPress={() => {
                    navigation.push('member', {
                      username: data.last_reply_by,
                    })
                  }}>
                  <Text className="text-xs font-bold" style={styles.text_desc}>
                    {data.last_reply_by}
                  </Text>
                </FixedPressable>
              </View>
            </>
          )}
        </View>
      </View>
      <View className="flex flex-row justify-end pl-1 pr-2">
        {!!replies && (
          <View className="rounded-full px-1" style={styles.tag.bg}>
            <Text className="text-xs" style={styles.tag.text}>
              {replies}
            </Text>
          </View>
        )}
      </View>
    </FixedPressable>
  )
}
