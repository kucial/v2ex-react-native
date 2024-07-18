import { Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import classNames from 'classnames'
import { Image } from 'expo-image'

import FixedPressable from '@/components/FixedPressable'
import { BlockText, Box, InlineText } from '@/components/Skeleton/Elements'
import TriangleCorner from '@/components/TriangleCorner'
import { useTheme } from '@/containers/ThemeService'
import { preloadTopicInfo } from '@/utils/preload'

import MaxWidthWrapper from '../MaxWidthWrapper'

export default function TideTopicRow(props: HomeFeedRowProps) {
  const { data, showAvatar, showLastReplyMember, isLast } = props
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { styles } = useTheme()

  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View
          className={classNames('flex flex-row items-center')}
          style={!isLast && styles.border_b_light}>
          {showAvatar ? (
            <View className="px-2 py-2 self-start">
              <Box className="w-[24px] h-[24px] rounded" />
            </View>
          ) : (
            <View className="pl-3"></View>
          )}
          <View className="flex-1 pt-1 pb-2">
            <BlockText lines={[1, 2]} style={styles.text_base}></BlockText>
            <View className="mt-1">
              <InlineText width={[80, 120]} style={styles.text_xs}></InlineText>
            </View>
          </View>
          <View className="flex flex-row justify-end pl-1 pr-2">
            <Box className="rounded-full px-2">
              <InlineText width={8} style={styles.text_xs} />
            </Box>
          </View>
        </View>
      </MaxWidthWrapper>
    )
  }

  const { node, member, title, replies } = props.data
  return (
    <MaxWidthWrapper style={styles.layer1}>
      <FixedPressable
        sentry-label="TideTopicRow"
        className={classNames('flex flex-row items-center active:opacity-50')}
        style={!isLast && styles.border_b_light}
        onPress={() => {
          preloadTopicInfo(props.data.id)
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
            'flex-1 pt-1 pb-2',
            props.viewedStatus === 'viewed' && 'opacity-70',
          )}>
          <Text
            className={classNames({
              'font-[500]': props.titleStyle === 'emphasized',
            })}
            style={[styles.text, styles.text_base]}>
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
              <Text style={[styles.text_desc, styles.text_xs]}>
                {node.title}
              </Text>
            </FixedPressable>
            {!showLastReplyMember && data?.last_reply_time && (
              <View className="mr-1">
                <Text style={[styles.text_meta, styles.text_xs]}>最后回复</Text>
              </View>
            )}
            <Text style={[styles.text_meta, styles.text_xs]}>
              {data?.last_reply_time}
            </Text>
            {data?.last_reply_time &&
              showLastReplyMember &&
              data?.last_reply_by && (
                <Text
                  className="px-1"
                  style={[styles.text_meta, styles.text_xs]}>
                  •
                </Text>
              )}
            {showLastReplyMember && data?.last_reply_by && (
              <View className="flex flex-row items-center">
                <Text style={[styles.text_meta, styles.text_xs]}>
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
                    className="font-[600]"
                    style={[styles.text_desc, styles.text_xs]}>
                    {data.last_reply_by}
                  </Text>
                </FixedPressable>
              </View>
            )}
          </View>
        </View>
        <View className="flex flex-row justify-end pl-1 pr-2">
          {!!replies && (
            <View className="rounded-full px-1" style={styles.tag__bg}>
              <Text style={[styles.tag__text, styles.text_xs]}>{replies}</Text>
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
