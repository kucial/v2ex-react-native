import { memo, useCallback, useMemo, useRef } from 'react'
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native'
import { ChatBubbleLeftRightIcon } from 'react-native-heroicons/outline'
import { HeartIcon as FilledHeartIcon } from 'react-native-heroicons/solid'
import { useRecyclingState } from '@shopify/flash-list'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import LottieView from 'lottie-react-native'
import { marked } from 'marked'

import HeartIcon from '@/components/HeartIcon'
import HtmlRender from '@/components/HtmlRender'
import MarkdownFilledIcon from '@/components/MarkdownFilledIcon'
import MarkdownIcon from '@/components/MarkdownIcon'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import ReplyIcon from '@/components/ReplyIcon'
import { BlockText, Box, InlineText } from '@/components/Skeleton/Elements'

import { useComposeAuthedNavigation } from '@/containers/AuthWatcher/hooks'
import { useTheme } from '@/containers/ThemeService'
import { usePressBreadcrumb } from '@/utils/hooks'
import { TopicReply } from '@/utils/v2ex-client/types'

import { ConversationContext, UserInfoContext } from './types'

type ReplyRowProps = {
  data: TopicReply
  style?: ViewStyle
  isPivot?: boolean
  isLast?: boolean
  hasConversation?: boolean
  // FIX: Accept pre-calculated contentWidth from the parent so that
  // useWindowDimensions() is not called inside every row instance.
  // Previously every ReplyRow subscribed to window dimension changes,
  // causing every visible row to re-render on orientation change.
  contentWidth: number
  onReply(data: TopicReply): void
  onShowConversation?: (data: ConversationContext) => void
  onShowUserInfo?: (data: UserInfoContext) => void
  onThank(data: TopicReply): void
  showAvatar?: boolean
}

function ReplyRow(props: ReplyRowProps) {
  // FIX: contentWidth is now a prop — see TopicScreen for where it is
  // calculated once at the screen level and passed down.
  const {
    data,
    isPivot,
    isLast,
    hasConversation,
    showAvatar = true,
    contentWidth,
    onReply,
    onThank,
    onShowConversation,
    onShowUserInfo,
    style,
  } = props
  const composeAuthedNavigation = useComposeAuthedNavigation()
  // useRecyclingState resets showMarkdown to false automatically when FlashList
  // recycles this cell for a different reply (deps=[data?.id]).
  // This avoids a stale markdown-visible state bleeding into the next item
  // without the extra setState call that would happen with plain useState.
  const [showMarkdown, setMarkdownVisible] = useRecyclingState(false, [
    data?.id,
  ])
  const { theme, styles, colorScheme } = useTheme()
  const router = useRouter()

  const heartIconRef = useRef<LottieView>(null)

  const iconColor = theme.colors.text_meta
  const likedActiveColor = theme.colors.icon_liked_bg

  const handleReply = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        onReply(data)
      }, [data, onReply]),
    ),
    {
      message: '[ReplyRow] `reply` button press',
      data: { target: data?.id },
    },
  )

  const toggleMarkdown = usePressBreadcrumb(
    useCallback(() => {
      setMarkdownVisible((prev) => !prev)
    }, [setMarkdownVisible]),
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
        onThank(data)
      }, [data, onThank]),
    ),
    {
      message: '[ReplyRow] `thank` button press',
      data: { target: data?.id },
    },
  )

  const handleConversation = usePressBreadcrumb(
    useCallback(() => {
      onShowConversation?.({
        type: 'reply',
        data: data,
      })
    }, [data, onShowConversation]),
    {
      message: '[ReplyRow] `conversation` button press',
      data: { target: data?.id },
    },
  )

  // NOTE: member is extracted below the early-return guard (const { member } = data),
  // so it is not in scope here. Read data?.member?.username at call time instead
  // so the callback always reflects the current prop value.
  const handleAvatarPress = useCallback(() => {
    const username = data?.member?.username
    if (onShowUserInfo) {
      onShowUserInfo({ type: 'member', data: username })
    } else {
      router.push(`/member/${username}`)
    }
  }, [data?.member?.username, onShowUserInfo, router])

  const htmlSource = useMemo(
    () => ({
      html: showMarkdown ? marked(data?.content || '') : data?.content_rendered,
      baseUrl: 'https://v2ex.com',
    }),
    [data?.content, data?.content_rendered, showMarkdown],
  )

  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View
          style={[
            rowStyles.skeletonContainer,
            styles.layer1,
            styles.border_b_light,
          ]}
        >
          <View style={rowStyles.skeletonRow}>
            {showAvatar && <Box style={rowStyles.skeletonAvatar} />}
            <View style={rowStyles.skeletonContent}>
              <View style={rowStyles.row}>
                <View style={rowStyles.skeletonHeaderLeft}>
                  <View>
                    <InlineText style={styles.text_xs} width={120}></InlineText>
                  </View>
                </View>
                <View style={rowStyles.skeletonHeaderRight}>
                  <InlineText style={styles.text_xs} width={24}></InlineText>
                </View>
              </View>
              <View style={rowStyles.pr2}>
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
    <MaxWidthWrapper style={style}>
      <View
        style={[
          rowStyles.container,
          !isLast && styles.border_b_light,
          isPivot && styles.highlight,
        ]}
      >
        <View style={rowStyles.rowPl2}>
          {showAvatar ? (
            <View style={rowStyles.avatarContainer}>
              {/* FIX: Use stable handleAvatarPress callback instead of inline arrow */}
              <Pressable hitSlop={3} onPress={handleAvatarPress}>
                <Image
                  source={{ uri: member.avatar_normal }}
                  priority='low'
                  recyclingKey={`user-avatar:${member.username}`}
                  style={rowStyles.avatarImage}
                />
              </Pressable>
            </View>
          ) : (
            <View style={rowStyles.noAvatarSpacer}></View>
          )}

          <View style={rowStyles.mainContent}>
            <View style={rowStyles.headerRow}>
              <View style={rowStyles.headerLeft}>
                {/* FIX: Use stable handleAvatarPress for username too */}
                <Pressable
                  hitSlop={4}
                  style={({ pressed }) => pressed && rowStyles.pressedOpacity}
                  onPress={handleAvatarPress}
                >
                  <Text
                    style={[
                      rowStyles.usernameText,
                      styles.text_desc,
                      styles.text_xs,
                    ]}
                  >
                    {member.username}
                  </Text>
                </Pressable>
                {data.member_is_op && (
                  <View
                    style={[
                      styles.border,
                      rowStyles.badgeContainer,
                      { borderColor: theme.colors.badge_bg },
                    ]}
                  >
                    <Text
                      style={[
                        rowStyles.badgeText,
                        { color: theme.colors.badge_bg },
                      ]}
                    >
                      OP
                    </Text>
                  </View>
                )}
                {data.member_is_mod && (
                  <View
                    style={[
                      styles.border,
                      styles.badge__bg,
                      rowStyles.badgeContainer,
                      {
                        borderColor: theme.colors.badge_bg,
                        backgroundColor: theme.colors.badge_border,
                      },
                    ]}
                  >
                    <Text style={[rowStyles.badgeText, styles.badge__text]}>
                      MOD
                    </Text>
                  </View>
                )}
                {data.member_is_pro && (
                  <View
                    style={[
                      styles.border,
                      styles.badge__bg,
                      rowStyles.badgeContainerPro,
                      {
                        borderColor: theme.colors.badge_bg,
                        backgroundColor: theme.colors.badge_border,
                      },
                    ]}
                  >
                    <Text style={[rowStyles.badgeText, styles.badge__text]}>
                      PRO
                    </Text>
                  </View>
                )}
                <View style={rowStyles.ml2}>
                  <Text style={[styles.text_meta, styles.text_xs]}>
                    {data.reply_time}
                  </Text>
                </View>
                {data.reply_device && (
                  <Text
                    style={[rowStyles.ml2, styles.text_meta, styles.text_xs]}
                  >
                    {data.reply_device}
                  </Text>
                )}
                {!!data.thanks_count && (
                  <>
                    <View style={rowStyles.dotContainer}>
                      <Text style={styles.text_meta}>·</Text>
                    </View>
                    <View style={rowStyles.thanksRow}>
                      <FilledHeartIcon size={14} color={likedActiveColor} />
                      <Text
                        style={[
                          rowStyles.ml1,
                          styles.text_meta,
                          styles.text_xs,
                        ]}
                      >
                        {data.thanks_count}
                      </Text>
                    </View>
                  </>
                )}
              </View>
              <View style={rowStyles.headerRight}>
                <View style={rowStyles.floorBadge}>
                  <Text style={[styles.text_meta, styles.text_xs]}>
                    #{data.num}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={[
                rowStyles.htmlContainer,
                { marginBottom: showMarkdown ? -14 : 0 },
              ]}
            >
              <HtmlRender
                source={htmlSource}
                onOpenMemberInfo={onShowUserInfo}
                // FIX: contentWidth is pre-calculated by the parent once,
                // rather than calling useWindowDimensions() in every row.
                contentWidth={contentWidth}
              />
            </View>
            <View style={rowStyles.actionsRow}>
              <View style={rowStyles.actionsLeft}>
                <Pressable
                  hitSlop={2}
                  style={({ pressed }) => [
                    rowStyles.actionButton,
                    pressed &&
                      (colorScheme === 'dark'
                        ? rowStyles.pressedDark
                        : rowStyles.pressedLight),
                  ]}
                  onPress={handleReply}
                >
                  <View style={rowStyles.buttonContent}>
                    <ReplyIcon size={14} color={iconColor} />
                    <View style={rowStyles.ml1}>
                      <Text style={[styles.text_meta, styles.text_xs]}>回复</Text>
                    </View>
                  </View>
                </Pressable>
                <View style={rowStyles.actionButtonSpacer}></View>
                <Pressable
                  hitSlop={2}
                  style={({ pressed }) => [
                    rowStyles.actionButton,
                    pressed &&
                      (colorScheme === 'dark'
                        ? rowStyles.pressedDark
                        : rowStyles.pressedLight),
                  ]}
                  onPress={handleThank}
                >
                  <View style={rowStyles.buttonContent}>
                    <HeartIcon
                      size={14}
                      liked={data.thanked}
                      ref={heartIconRef}
                    />
                    <View style={rowStyles.ml1}>
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
                  </View>
                </Pressable>

                <View style={rowStyles.actionButtonSpacer}></View>
                {hasConversation && (
                  <Pressable
                    hitSlop={2}
                    style={({ pressed }) => [
                      rowStyles.actionButton,
                      pressed &&
                        (colorScheme === 'dark'
                          ? rowStyles.pressedDark
                          : rowStyles.pressedLight),
                    ]}
                    onPress={handleConversation}
                  >
                    <View style={rowStyles.buttonContent}>
                      <ChatBubbleLeftRightIcon size={14} color={iconColor} />
                      <View style={rowStyles.ml1}>
                        <Text style={[styles.text_meta, styles.text_xs]}>
                          会话
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                )}
              </View>

              <View style={rowStyles.markdownButtonContainer}>
                <Pressable
                  key={data.id}
                  hitSlop={2}
                  style={({ pressed }) => [
                    rowStyles.markdownButton,
                    pressed &&
                      (colorScheme === 'dark'
                        ? rowStyles.pressedDark
                        : rowStyles.pressedLight),
                  ]}
                  onPress={toggleMarkdown}
                >
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

const rowStyles = StyleSheet.create({
  // Skeleton / loading
  skeletonContainer: {
    paddingVertical: 8,
  },
  skeletonRow: {
    flexDirection: 'row',
    paddingLeft: 8,
  },
  skeletonAvatar: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 8,
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
  },
  skeletonHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  skeletonHeaderRight: {
    paddingRight: 8,
    justifyContent: 'center',
  },
  pr2: {
    paddingRight: 8,
  },

  // Main ReplyRow styles
  container: {
    paddingTop: 8,
  },
  rowPl2: {
    flexDirection: 'row',
    paddingLeft: 8,
  },
  avatarContainer: {
    marginRight: 8,
  },
  noAvatarSpacer: {
    marginRight: 4,
  },
  avatarImage: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  mainContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  usernameText: {
    fontWeight: 'bold',
  },
  pressedOpacity: {
    opacity: 0.6,
  },
  badgeContainer: {
    marginLeft: 8,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  badgeContainerPro: {
    marginLeft: 8,
    paddingHorizontal: 4,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 17,
  },
  ml2: {
    marginLeft: 8,
  },
  dotContainer: {
    position: 'relative',
    top: 1,
    marginHorizontal: 4,
  },
  thanksRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ml1: {
    marginLeft: 4,
  },
  headerRight: {
    paddingRight: 4,
    justifyContent: 'center',
  },
  floorBadge: {
    paddingHorizontal: 3,
    borderRadius: 9999,
  },
  htmlContainer: {
    paddingRight: 8,
    paddingBottom: 4,
    minHeight: 28,
  },
  actionsRow: {
    paddingVertical: 10,
    position: 'relative',
    flexDirection: 'row',
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionButton: {
    height: 36,
    paddingHorizontal: 8,
    margin: -8,
    borderRadius: 9999,
    position: 'relative',
    zIndex: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonSpacer: {
    width: 16,
  },
  pressedLight: {
    backgroundColor: '#e5e5e5',
    opacity: 0.6,
  },
  pressedDark: {
    backgroundColor: '#525252',
    opacity: 0.6,
  },
  markdownButtonContainer: {
    marginRight: 4,
    flexDirection: 'row',
  },
  markdownButton: {
    height: 36,
    width: 36,
    marginVertical: -8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    position: 'relative',
    zIndex: 10,
  },
})

export default memo(ReplyRow)
