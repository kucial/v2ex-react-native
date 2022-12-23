import { memo, useState } from 'react'
import { Pressable, Text, useWindowDimensions, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import {
  ChatBubbleLeftRightIcon,
  HeartIcon,
} from 'react-native-heroicons/outline'
import { HeartIcon as FilledHeartIcon } from 'react-native-heroicons/solid'
import classNames from 'classnames'
import { marked } from 'marked'
import PropTypes from 'prop-types'

import HtmlRender from '@/components/HtmlRender'
import MarkdownFilledIcon from '@/components/MarkdownFilledIcon'
import MarkdownIcon from '@/components/MarkdownIcon'
import ReplyIcon from '@/components/ReplyIcon'
import { BlockText, Box, InlineText } from '@/components/Skeleton/Elements'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'

function ReplyRow(props) {
  const { width } = useWindowDimensions()
  const { navigation } = props
  const { data, isPivot } = props
  const { composeAuthedNavigation } = useAuthService()
  const [showMarkdown, setMarkdownVisible] = useState(false)
  const { theme, styles } = useTheme()

  const iconColor = theme.colors.text_meta
  const likedActiveColor = theme.colors.bg_liked

  if (!data) {
    return (
      <View style={[styles.layer1, styles.border_b]}>
        <View className="flex-1 py-2 pl-1">
          <View className="flex flex-row mb-2">
            <View className="flex flex-row items-center flex-1 pl-1 ">
              <Box className="w-[24px] h-[24px] rounded" />
              <View className="ml-2">
                <InlineText className="text-xs" width={120}></InlineText>
              </View>
            </View>
            <View className="pr-2 space-x-2 justify-center">
              <InlineText className="text-xs" width={24}></InlineText>
            </View>
          </View>
          <View className="pl-[34px] pr-4">
            <BlockText lines={[2, 4]} />
          </View>
        </View>
      </View>
    )
  }

  const { member } = data
  return (
    <View
      className={classNames('pt-2', isPivot && 'bg-yellow-700/5')}
      style={[styles.border_b, styles.border_light, props.style]}>
      <View className="flex flex-row pl-2">
        <View className="mr-2">
          <Pressable
            hitSlop={3}
            onPress={() => {
              navigation.push('member', {
                username: member.username,
              })
            }}>
            <FastImage
              source={{
                uri: member.avatar_normal,
                priority: FastImage.priority.low,
              }}
              className="w-[24px] h-[24px] rounded"
            />
          </Pressable>
        </View>
        <View className="flex-1">
          <View className="flex flex-row mb-2">
            <View className="flex flex-row items-center flex-1">
              <Pressable
                hitSlop={4}
                className="active:opacity-60"
                onPress={() => {
                  navigation.push('member', {
                    username: member.username,
                  })
                }}>
                <Text className="font-bold text-xs" style={styles.text_desc}>
                  {member.username}
                </Text>
              </Pressable>
              {data.member_is_op && (
                <View
                  className="ml-2 px-1 rounded"
                  style={[
                    styles.border,
                    {
                      borderColor: theme.colors.badge,
                    },
                  ]}>
                  <Text
                    className="text-[10px] font-medium leading-[17px]"
                    style={{ color: theme.colors.badge }}>
                    OP
                  </Text>
                </View>
              )}
              {data.member_is_mod && (
                <View
                  className="ml-2 px-1 rounded"
                  style={[
                    styles.border,
                    styles.badge.bg,
                    {
                      borderColor: theme.colors.badge,
                      backgroundColor: theme.colors.badge,
                    },
                  ]}>
                  <Text
                    className="text-[10px] font-medium leading-[17px]"
                    style={styles.badge.text}>
                    MOD
                  </Text>
                </View>
              )}
              <View className="ml-2">
                <Text className="text-xs" style={styles.text_meta}>
                  {data.reply_time}
                </Text>
              </View>
              {data.reply_device && (
                <Text className="ml-2 text-xs" style={styles.text_meta}>
                  {data.reply_device}
                </Text>
              )}
              {!!data.thanks_count && (
                <>
                  <View className="relative top-[1px] mx-1">
                    <Text style={styles.text_meta}>·</Text>
                  </View>
                  <View className="flex flex-row items-center">
                    <FilledHeartIcon size={14} color={likedActiveColor} />
                    <Text className="text-xs ml-1" style={styles.text_meta}>
                      {data.thanks_count}
                    </Text>
                  </View>
                </>
              )}
            </View>
            <View className="pr-1 justify-center">
              <View className="px-[3px] rounded-full">
                <Text className="text-xs" style={styles.text_meta}>
                  #{data.num}
                </Text>
              </View>
            </View>
          </View>
          <View
            className="pr-2 min-h-[28px]"
            style={{
              marginBottom: showMarkdown ? -14 : 0,
            }}>
            <HtmlRender
              contentWidth={width - 24 - 8 - 8 - 16}
              source={{
                html: showMarkdown
                  ? marked(data.content, (err, result) =>
                      err ? err.message : `<div>${result}</div>`,
                    )
                  : data.content_rendered,
                baseUrl: 'https://v2ex.com',
              }}
            />
          </View>
          <View className="py-[10px] relative flex flex-row ">
            <View className="flex flex-row items-center flex-1">
              <Pressable
                hitSlop={2}
                className={classNames(
                  'h-[36px] px-2',
                  '-m-2 flex flex-row items-center justify-center rounded-full',
                  'active:bg-neutral-200 active:opacity-60 dark:active:bg-neutral-600',
                  'relative z-10',
                )}
                onPress={composeAuthedNavigation(() => {
                  props.onReply(data)
                })}>
                <ReplyIcon size={14} color={iconColor} />
                <View className="ml-1">
                  <Text className="text-xs text-neutral-500">回复</Text>
                </View>
              </Pressable>
              <View className="w-4"></View>
              {data.thanked ? (
                <Text className="text-xs text-neutral-500">已感谢</Text>
              ) : (
                <Pressable
                  hitSlop={2}
                  className={classNames(
                    'h-[36px] px-2',
                    '-m-2 flex flex-row items-center justify-center rounded-full',
                    'active:bg-neutral-200 active:opacity-60 dark:active:bg-neutral-600',
                    'relative z-10',
                  )}
                  onPress={composeAuthedNavigation(() => {
                    props.onThank(data)
                  })}>
                  <HeartIcon size={14} color={iconColor} />
                  <View className="ml-1">
                    <Text className="text-xs text-neutral-500">感谢</Text>
                  </View>
                </Pressable>
              )}
              <View className="w-4"></View>
              {props.hasConversation && (
                <Pressable
                  hitSlop={2}
                  className={classNames(
                    'h-[36px] px-2',
                    '-m-2 flex flex-row items-center justify-center rounded-full',
                    'active:bg-neutral-200 active:opacity-60 dark:active:bg-neutral-600',
                    'relative z-10',
                  )}
                  onPress={() => {
                    props.onShowConversation(data)
                  }}>
                  <ChatBubbleLeftRightIcon size={14} color={iconColor} />
                  <View className="ml-1">
                    <Text className="text-xs text-neutral-500">会话</Text>
                  </View>
                </Pressable>
              )}
            </View>

            <View className="mr-1 flex flex-row">
              <Pressable
                hitSlop={2}
                className={classNames(
                  'h-[36px] w-[36px]',
                  '-my-2 flex flex-row items-center justify-center rounded-full',
                  'active:bg-neutral-200 active:opacity-60 dark:active:bg-neutral-600',
                  'relative z-10',
                )}
                onPress={() => {
                  setMarkdownVisible((prev) => !prev)
                }}>
                {showMarkdown ? (
                  <MarkdownFilledIcon
                    size={20}
                    color={theme.colors.bg_markdown}
                  />
                ) : (
                  <MarkdownIcon size={20} color={iconColor} />
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

ReplyRow.propTypes = {
  data: PropTypes.object,
  onThank: PropTypes.func,
  onReply: PropTypes.func,
  hasConversation: PropTypes.bool,
  isPivot: PropTypes.bool,
  onShowConversation: PropTypes.func,
}

export default ReplyRow
