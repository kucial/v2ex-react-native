import { memo } from 'react'
import { Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import classNames from 'classnames'
import { Image } from 'expo-image'

import FixedPressable from '@/components/FixedPressable'
import { BlockText, Box, InlineText } from '@/components/Skeleton/Elements'
import TriangleCorner from '@/components/TriangleCorner'
import { useTheme } from '@/containers/ThemeService'
import { preloadTopicInfo } from '@/utils/preload'

import MaxWidthWrapper from '../MaxWidthWrapper'

function NodeTopicRow(props: NodeFeedRowProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { data, showAvatar, isLast } = props

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
            <BlockText
              randomWidth
              lines={[1, 2]}
              style={styles.text_base}></BlockText>
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

  const { member, replies } = data

  return (
    <MaxWidthWrapper style={styles.layer1}>
      <FixedPressable
        className="flex flex-row items-center active:opacity-60"
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
                className="w-[24px] h-[24px] rounded"
                recyclingKey={`user-avatar:${member.username}`}
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
            'flex-1 pt-1 pb-2',
            props.viewedStatus === 'viewed' && 'opacity-70',
          )}>
          <Text
            className={classNames({
              'font-[600]': props.titleStyle === 'emphasized',
            })}
            style={[styles.text, styles.text_base]}>
            {data.title}
          </Text>
          <View className="mt-1 flex flex-row">
            <Text
              className="font-[600]"
              style={[styles.text_desc, styles.text_xs]}>
              {member.username}
            </Text>
            {!!data.characters && (
              <>
                <Text
                  className="px-1"
                  style={[styles.text_meta, styles.text_xs]}>
                  ·
                </Text>
                <Text style={[styles.text_meta, styles.text_xs]}>
                  {data.characters} 字符
                </Text>
              </>
            )}
            {!!data.clicks && (
              <>
                <Text
                  className="px-1"
                  style={[styles.text_meta, styles.text_xs]}>
                  ·
                </Text>
                <Text style={[styles.text_meta, styles.text_xs]}>
                  {data.clicks} 次点击
                </Text>
              </>
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
export default memo(NodeTopicRow)
