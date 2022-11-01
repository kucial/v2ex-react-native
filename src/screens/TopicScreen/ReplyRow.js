import { memo, useState } from 'react'
import { Pressable, Text, useWindowDimensions, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import {
  ChatBubbleLeftRightIcon,
  HeartIcon
} from 'react-native-heroicons/outline'
import { HeartIcon as FilledHeartIcon } from 'react-native-heroicons/solid'
import classNames from 'classnames'
import { marked } from 'marked'
import PropTypes from 'prop-types'
import colors from 'tailwindcss/colors'
import { useColorScheme } from 'tailwindcss-react-native'

import HtmlRender from '@/components/HtmlRender'
import MarkdownFilledIcon from '@/components/MarkdownFilledIcon'
import MarkdownIcon from '@/components/MarkdownIcon'
import ReplyIcon from '@/components/ReplyIcon'
import { BlockText, Box, InlineText } from '@/components/Skeleton/Elements'
import { useAuthService } from '@/containers/AuthService'

function ReplyRow(props) {
  const { width } = useWindowDimensions()
  const { navigation } = props
  const { data, isPivot } = props
  const { composeAuthedNavigation } = useAuthService()
  const [showMarkdown, setMarkdownVisible] = useState(false)
  const { colorScheme } = useColorScheme()
  const iconColor =
    colorScheme === 'dark' ? colors.neutral[300] : colors.neutral[600]

  if (!data) {
    return (
      <View
        className={classNames(
          'border-b bg-white border-neutral-200',
          'dark:bg-neutral-900 dark:border-neutral-600'
        )}>
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
      style={props.style}
      className={classNames(
        'border-b border-neutral-200 pt-2',
        isPivot && 'bg-yellow-700/5',
        // isPivot
        //   ? 'bg-yellow-50 dark:bg-[#2a2720]'
        //   : 'bg-white dark:bg-neutral-900',
        'dark:border-neutral-600'
      )}>
      <View className="flex flex-row pl-2">
        <View className="mr-2">
          <Pressable
            hitSlop={3}
            onPress={() => {
              navigation.push('member', {
                username: member.username
              })
            }}>
            <FastImage
              source={{
                uri: member.avatar_normal,
                priority: FastImage.priority.low
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
                    username: member.username
                  })
                }}>
                <Text className="font-bold text-xs text-neutral-700 dark:text-neutral-300">
                  {member.username}
                </Text>
              </Pressable>
              {data.member_is_op && (
                <View className="ml-2 px-1 rounded border border-blue-600 dark:border-sky-300">
                  <Text className="text-[10px] font-medium leading-[17px] text-blue-600 dark:text-sky-300">
                    OP
                  </Text>
                </View>
              )}
              {data.member_is_mod && (
                <View className="ml-2 px-1 rounded border border-blue-600 bg-blue-600 dark:border-sky-300 dark:bg-sky-400/90">
                  <Text className="text-[10px] font-medium leading-[17px] text-white dark:text-neutral-100">
                    MOD
                  </Text>
                </View>
              )}
              <View className="ml-2">
                <Text className="text-xs text-neutral-400 dark:text-neutral-300">
                  {data.reply_time}
                </Text>
              </View>
              {data.reply_device && (
                <Text className="ml-2 text-xs text-neutral-400 dark:text-neutral-300">
                  {data.reply_device}
                </Text>
              )}
              {!!data.thanks_count && (
                <>
                  <View className="relative top-[1px] mx-1">
                    <Text className="text-neutral-400 dark:text-neutral-300">
                      ·
                    </Text>
                  </View>
                  <View className="flex flex-row items-center">
                    <FilledHeartIcon
                      size={14}
                      color={
                        colorScheme === 'dark'
                          ? colors.rose[400]
                          : colors.red[600]
                      }
                    />
                    <Text className="text-xs text-neutral-400 ml-1 dark:text-neutral-300">
                      {data.thanks_count}
                    </Text>
                  </View>
                </>
              )}
            </View>
            <View className="pr-1 justify-center">
              <View className="px-[3px] rounded-full">
                <Text className="text-xs text-neutral-400 dark:text-neutral-300">
                  #{data.num}
                </Text>
              </View>
            </View>
          </View>
          <View className="pr-2 min-h-[28px]">
            <HtmlRender
              contentWidth={width - 24 - 8 - 8 - 16}
              source={{
                html: showMarkdown
                  ? marked(data.content, (err, result) =>
                      err ? err.message : `<div>${result}</div>`
                    )
                  : data.content_rendered,
                baseUrl: 'https://v2ex.com'
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
                  'relative z-10'
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
                    'relative z-10'
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
                    'relative z-10'
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
                  'relative z-10'
                )}
                onPress={() => {
                  setMarkdownVisible((prev) => !prev)
                }}>
                {showMarkdown ? (
                  <MarkdownFilledIcon
                    size={20}
                    color={
                      colorScheme === 'dark'
                        ? colors.emerald[200]
                        : colors.green[700]
                    }
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
  onShowConversation: PropTypes.func
}

export default memo(ReplyRow)
