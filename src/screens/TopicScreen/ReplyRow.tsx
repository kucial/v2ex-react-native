import { memo, useCallback, useRef, useState } from 'react'
import {
  Pressable,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native'
import { ChatBubbleLeftRightIcon } from 'react-native-heroicons/outline'
import { HeartIcon as FilledHeartIcon } from 'react-native-heroicons/solid'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import classNames from 'classnames'
import { Image } from 'expo-image'
import LottieView from 'lottie-react-native'
import { marked } from 'marked'

import HeartIcon from '@/components/HeartIcon'
import HtmlRender from '@/components/HtmlRender'
import MarkdownFilledIcon from '@/components/MarkdownFilledIcon'
import MarkdownIcon from '@/components/MarkdownIcon'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import ReplyIcon from '@/components/ReplyIcon'
import { BlockText, Box, InlineText } from '@/components/Skeleton/Elements'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'
import { usePressBreadcrumb } from '@/utils/hooks'
import { TopicReply } from '@/utils/v2ex-client/types'

import { ConversationContext, UserInfoContext } from './types'

type ReplyRowProps = {
  data: TopicReply
  style?: ViewStyle
  isPivot?: boolean
  isLast?: boolean
  navigation: NativeStackNavigationProp<AppStackParamList>
  hasConversation?: boolean
  onReply(data: TopicReply): void
  onShowConversation?: (data: ConversationContext) => void
  onShowUserInfo?: (data: UserInfoContext) => void
  onThank(data: TopicReply): void
  showAvatar?: boolean
}

function ReplyRow(props: ReplyRowProps) {
  const { width } = useWindowDimensions()
  const {
    data: { maxContainerWidth },
  } = useAppSettings()
  const CONTAINER_WIDTH = Math.min(maxContainerWidth, width)
  const { data, isPivot, isLast, navigation, showAvatar = true } = props
  const { composeAuthedNavigation } = useAuthService()
  const [showMarkdown, setMarkdownVisible] = useState(false)
  const { theme, styles, colorScheme } = useTheme()

  const heartIconRef = useRef<LottieView>()

  const iconColor = theme.colors.text_meta
  const likedActiveColor = theme.colors.icon_liked_bg

  const handleReply = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        props.onReply(data)
      }, [data, props.onReply]),
    ),
    {
      message: '[ReplyRow] `reply` button press',
      data: { target: data?.id },
    },
  )
  const toggleMarkdown = usePressBreadcrumb(
    useCallback(() => {
      setMarkdownVisible((prev) => !prev)
    }, []),
    {
      message: '[ReplyRow] `markdown` button press',
      data: { target: data?.id },
    },
  )

  const handleThank = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        if (data?.thanked) {
          return
        }
        heartIconRef.current?.play()
        props.onThank(data)
      }, [data, data?.thanked, props.onThank]),
    ),
    {
      message: '[ReplyRow] `thank` button press',
      data: { target: data?.id },
    },
  )

  const handleConversation = usePressBreadcrumb(
    useCallback(() => {
      props.onShowConversation({
        type: 'reply',
        data: data,
      })
    }, [data, props.onShowConversation]),
    {
      message: '[ReplyRow] `conversation` button press',
      data: { target: data?.id },
    },
  )

  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View className="py-2" style={[styles.layer1, styles.border_b_light]}>
          <View className="flex flex-row pl-2">
            {showAvatar && <Box className="w-[24px] h-[24px] rounded mr-2" />}
            <View className="flex-1 ml-1">
              <View className="flex flex-row">
                <View className="flex flex-row items-center flex-1">
                  <View className="">
                    <InlineText style={styles.text_xs} width={120}></InlineText>
                  </View>
                </View>
                <View className="pr-2 space-x-2 justify-center">
                  <InlineText style={styles.text_xs} width={24}></InlineText>
                </View>
              </View>
              <View className="pr-2">
                <BlockText lines={[2, 4]} />
              </View>
            </View>
          </View>
        </View>
      </MaxWidthWrapper>
    )
  }

  const { member } = data
  return (
    <MaxWidthWrapper style={props.style}>
      <View
        className={classNames('pt-2')}
        style={[!isLast && styles.border_b_light, isPivot && styles.highlight]}>
        <View className="flex flex-row pl-2">
          {showAvatar ? (
            <View className="mr-2">
              <Pressable
                hitSlop={3}
                onPress={() => {
                  if (props.onShowUserInfo) {
                    props.onShowUserInfo({
                      type: 'member',
                      data: member.username,
                    })
                  } else {
                    navigation.push('member', {
                      username: member.username,
                    })
                  }
                }}>
                <Image
                  source={{
                    uri: member.avatar_normal,
                  }}
                  priority="low"
                  recyclingKey={`user-avatar:${member.username}`}
                  className="w-[24px] h-[24px] rounded"
                />
              </Pressable>
            </View>
          ) : (
            <View className="mr-1"></View>
          )}

          <View className="flex-1">
            <View className="flex flex-row mb-2">
              <View className="flex flex-row items-center flex-1">
                <Pressable
                  hitSlop={4}
                  className="active:opacity-60"
                  onPress={() => {
                    if (props.onShowUserInfo) {
                      props.onShowUserInfo({
                        type: 'member',
                        data: member.username,
                      })
                    } else {
                      navigation.push('member', {
                        username: member.username,
                      })
                    }
                  }}>
                  <Text
                    className="font-bold"
                    style={[styles.text_desc, styles.text_xs]}>
                    {member.username}
                  </Text>
                </Pressable>
                {data.member_is_op && (
                  <View
                    className="ml-2 px-1 rounded"
                    style={[
                      styles.border,
                      {
                        borderColor: theme.colors.badge_bg,
                      },
                    ]}>
                    <Text
                      className="text-[10px] font-medium leading-[17px]"
                      style={{ color: theme.colors.badge_bg }}>
                      OP
                    </Text>
                  </View>
                )}
                {data.member_is_mod && (
                  <View
                    className="ml-2 px-1 rounded"
                    style={[
                      styles.border,
                      styles.badge__bg,
                      {
                        borderColor: theme.colors.badge_bg,
                        backgroundColor: theme.colors.badge_border,
                      },
                    ]}>
                    <Text
                      className="text-[10px] font-medium leading-[17px]"
                      style={styles.badge__text}>
                      MOD
                    </Text>
                  </View>
                )}
                <View className="ml-2">
                  <Text style={[styles.text_meta, styles.text_xs]}>
                    {data.reply_time}
                  </Text>
                </View>
                {data.reply_device && (
                  <Text
                    className="ml-2"
                    style={[styles.text_meta, styles.text_xs]}>
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
                      <Text
                        className="ml-1"
                        style={[styles.text_meta, styles.text_xs]}>
                        {data.thanks_count}
                      </Text>
                    </View>
                  </>
                )}
              </View>
              <View className="pr-1 justify-center">
                <View className="px-[3px] rounded-full">
                  <Text style={[styles.text_meta, styles.text_xs]}>
                    #{data.num}
                  </Text>
                </View>
              </View>
            </View>
            <View
              className="pr-2 pb-1 min-h-[28px]"
              style={{
                marginBottom: showMarkdown ? -14 : 0,
              }}>
              <HtmlRender
                key={data.id + colorScheme}
                navigation={navigation}
                onOpenMemberInfo={props.onShowUserInfo}
                contentWidth={CONTAINER_WIDTH - 24 - 8 - 8 - 16}
                source={{
                  html: showMarkdown
                    ? marked(data.content)
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
                  onPress={handleReply}>
                  <ReplyIcon size={14} color={iconColor} />
                  <View className="ml-1">
                    <Text style={[styles.text_meta, styles.text_xs]}>回复</Text>
                  </View>
                </Pressable>
                <View className="w-4"></View>
                <Pressable
                  hitSlop={2}
                  className={classNames(
                    'h-[36px] px-2',
                    '-m-2 flex flex-row items-center justify-center rounded-full',
                    'active:bg-neutral-200 active:opacity-60 dark:active:bg-neutral-600',
                    'relative z-10',
                  )}
                  onPress={handleThank}>
                  <HeartIcon
                    size={14}
                    liked={data.thanked}
                    ref={heartIconRef}
                  />
                  <View className="ml-1">
                    {data.thanked ? (
                      <Text style={[styles.text_meta, styles.text_xs]}>
                        已感谢
                      </Text>
                    ) : (
                      <Text style={[styles.text_meta, styles.text_xs]}>
                        感谢
                      </Text>
                    )}
                  </View>
                </Pressable>

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
                    onPress={handleConversation}>
                    <ChatBubbleLeftRightIcon size={14} color={iconColor} />
                    <View className="ml-1">
                      <Text style={[styles.text_meta, styles.text_xs]}>
                        会话
                      </Text>
                    </View>
                  </Pressable>
                )}
              </View>

              <View className="mr-1 flex flex-row">
                <Pressable
                  key={data.id}
                  hitSlop={2}
                  className={classNames(
                    'h-[36px] w-[36px]',
                    '-my-2 flex flex-row items-center justify-center rounded-full',
                    'active:bg-neutral-200 active:opacity-60 dark:active:bg-neutral-600',
                    'relative z-10',
                  )}
                  onPress={toggleMarkdown}>
                  {showMarkdown ? (
                    <MarkdownFilledIcon
                      size={20}
                      color={theme.colors.icon_markdown_bg}
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
    </MaxWidthWrapper>
  )
}

export default memo(ReplyRow)
