import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  InteractionManager,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { EllipsisHorizontalIcon } from 'react-native-heroicons/outline'
import {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Share from 'react-native-share'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { FlashList } from '@shopify/flash-list'
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'

import AnimatedFlashList from '@/components/AnimatedFlashList'
import AnimatedHeader from '@/components/AnimatedHeader'
import Button from '@/components/Button'
import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'
import TopicSkeleton from '@/components/Skeleton/TopicSkeleton'

import { useAlertService } from '@/containers/AlertService'
import {
  useAppSettings,
  useMaxContainerWidth,
  usePadLayout,
} from '@/containers/AppSettingsService'
import { useComposeAuthedNavigation } from '@/containers/AuthWatcher/hooks'
import { useTheme } from '@/containers/ThemeService'
import { useTopicSheetService } from '@/containers/TopicSheetService'
import { useTouchViewedTopic } from '@/containers/ViewedTopicsService'
import { useAuthStore, useCurrentUser } from '@/stores/auth'
import { getRelatedReplies } from '@/utils/content'
import { useCachedState } from '@/utils/hooks'
import { isLoading, shouldLoadMore } from '@/utils/react-query'
import { isBouncingBottom, isBouncingTop } from '@/utils/scroll'
import { setJSON } from '@/utils/storage'
import * as v2exClient from '@/utils/v2ex-client'
import ApiError from '@/utils/v2ex-client/ApiError'
import { TopicDetail, TopicReply } from '@/utils/v2ex-client/types'

import BottomBar from './BottomBar'
import PadSidebar from './PadSidebar'
import ReplyRow from './ReplyRow'
import { ScrollControlApi } from './ScrollControl'
import ScrollToLastPosition from './ScrollToLastPosition'
import SimpleMemberInfo from './SimpleMemberInfo'
import TopBottomNav from './TopBottomNav'
import TopicBaseInfo from './TopicBaseInfo'
import TopicMovePanel from './TopicMovePanel'
import { ConversationContext, ReplyContext, UserInfoContext } from './types'

const REPLY_PAGE_SIZE = 100
const getPageNum = (num: number) => Math.ceil(num / REPLY_PAGE_SIZE)
const getTopicLink = (id: string | number) => `https://v2ex.com/t/${id}`

const getMemberReplies = (pivot: string, replyList: TopicReply[]) => {
  return replyList.filter((item) => item.member.username === pivot)
}

function TopicScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  const { id: rawId, brief: rawBrief } = params
  const id = Array.isArray(rawId) ? rawId[0] : rawId
  const topicId = Number(id)
  const brief = Array.isArray(rawBrief)
    ? rawBrief[0]
    : rawBrief
      ? JSON.parse(rawBrief)
      : undefined

  const alert = useAlertService()
  const queryClient = useQueryClient()
  const topicQuery = useQuery({
    queryKey: [`/page/t/:id/topic.json`, topicId.toString()],
    queryFn: async () => {
      const { data } = await v2exClient.getTopicDetail({ id: topicId })
      return data
    },
    refetchOnMount: false,
  })

  const topic = topicQuery.data || (brief as TopicDetail | undefined)

  const touchViewed = useTouchViewedTopic()
  const [lastIndex, setLastIndex] = useCachedState(
    `$app$/topic/${id}/last-position`,
    null,
  )
  const [showScrollToLastPosition, setShowScrollToLastPosition] =
    useState(false)

  const fetchReplies = useCallback(
    async ({ pageParam }) => {
      const data = await v2exClient.getTopicReplies({ id, p: pageParam })
      if (data.meta?.topic) {
        queryClient.setQueryData(
          [`/page/t/:id/topic.json`, id.toString()],
          data.meta.topic,
        )
      }
      return data
    },
    [id],
  )

  const repliesQuery = useInfiniteQuery({
    queryKey: [`/page/t/:id/replies.json`, id],
    queryFn: fetchReplies,
    initialPageParam: 1,
    getNextPageParam(lastPage) {
      if (
        lastPage.pagination &&
        lastPage.pagination.total > lastPage.pagination.current
      ) {
        return lastPage.pagination.current + 1
      }
      return undefined
    },
    refetchOnMount: true,
  })

  const { showActionSheetWithOptions } = useActionSheet()
  useEffect(() => {
    if (topicQuery.data) {
      if (lastIndex && !showScrollToLastPosition) {
        setShowScrollToLastPosition(true)
      }
      if (topicQuery.data) {
        setTimeout(() => {
          touchViewed(topicQuery.data)
        }, 500)
      }
    }
  }, [topicQuery.data])

  const { data: settings } = useAppSettings()
  const padLayout = usePadLayout()

  // FIX: Calculate contentWidth once here so ReplyRow doesn't need to call
  // useWindowDimensions() itself — that caused every visible row to re-render
  // on orientation change. Now only TopicScreen re-renders, and only the rows
  // whose contentWidth prop actually changed will follow.
  const { width } = useWindowDimensions()
  const maxContainerWidth = useMaxContainerWidth()
  const contentWidth = useMemo(
    () => Math.min(maxContainerWidth, width) - 24 - 8 - 8 - 16,
    [maxContainerWidth, width],
  )

  const listRef = useRef<any>(null)
  const changeNodeModalRef = useRef<TrueSheet>(null)
  const scrollControlRef = useRef<ScrollControlApi>(null)
  const currentIndexRef = useRef(null)
  const [myReplies, setMyReplies] = useCachedState<TopicReply[]>(
    `my-topic-replies:${id}`,
    [],
  )

  const composeAuthedNavigation = useComposeAuthedNavigation()
  const currentUser = useCurrentUser()
  const {
    showConversation,
    showUserInfo,
    showReplyForm,
    dismissReplyForm,
    dismissAll,
  } = useTopicSheetService()

  const { styles, colorScheme } = useTheme()

  const replyItems = useMemo(() => {
    if (repliesQuery.isLoading && !repliesQuery.error) {
      return new Array(10)
    }
    const items =
      repliesQuery.data?.pages.reduce((combined, page) => {
        if (page.data) {
          return [...combined, ...page.data]
        }
        return combined
      }, myReplies) || []

    // FIX: sort into a new array instead of mutating in place
    return [...items].sort((a, b) => a.num - b.num)
  }, [
    repliesQuery.data?.pages,
    repliesQuery.isLoading,
    repliesQuery.error,
    myReplies,
  ])

  // cleanup replies
  useEffect(() => {
    if (myReplies.length && repliesQuery.data) {
      for (let i = 0; i < myReplies.length; i += 1) {
        let loaded = false
        const myReply = myReplies[i]
        const page = Math.ceil(myReply.num / 100)
        const page_i = myReply.num % 100
        if (
          repliesQuery.data.pages[page - 1] &&
          repliesQuery.data.pages[page - 1].data.length > page_i
        ) {
          loaded = true
        }
        if (loaded) {
          setMyReplies((prev) => {
            const index = prev.findIndex((item) => item.id == myReply.id)
            if (index > -1) {
              return [...prev.slice(0, index), ...prev.slice(index + 1)]
            }
            return prev
          })
        }
      }
    }
    // FIX: removed myReplies from deps to avoid re-trigger loop.
    // repliesQuery.data?.pages is sufficient — when a page loads we check
    // whether any of the optimistic replies have been superseded.
  }, [repliesQuery.data?.pages])

  const handleToggleBlock = composeAuthedNavigation(
    useCallback(() => {
      const indicator = alert.show({
        type: 'default',
        message: '处理中',
        loading: true,
        duration: 0,
      })
      const request = topic?.blocked
        ? v2exClient.unblockTopic
        : v2exClient.blockTopic

      request({ id })
        .then(({ data }) => {
          topicQuery.data &&
            queryClient.setQueryData(
              [`/page/t/:id/topic.json`, id.toString()],
              { ...topicQuery.data, ...data },
            )
          alert.show({
            type: 'success',
            message: data.blocked ? '已忽略主题' : '已撤销主题忽略',
          })
        })
        .catch((err) => {
          alert.show({ type: 'error', message: err.message })
        })
        .finally(() => {
          alert.hide(indicator)
        })
    }, [id, topic?.blocked]),
  )

  const handleReportTopic = composeAuthedNavigation(
    useCallback(() => {
      const indicator = alert.show({
        type: 'default',
        message: '正在举报',
        loading: true,
        duration: 0,
      })
      v2exClient
        .reportTopic({ id })
        .then(({ data }) => {
          topicQuery.data &&
            queryClient.setQueryData(
              [`/page/t/:id/topic.json`, id.toString()],
              { ...topicQuery.data, ...data },
            )
          if (data.reported) {
            alert.show({ type: 'success', message: '已举报主题' })
          } else {
            alert.show({ type: 'error', message: '未成功举报举报主题' })
          }
        })
        .catch((err) => {
          alert.show({ type: 'error', message: err.message })
        })
        .finally(() => {
          alert.hide(indicator)
        })
    }, [id]),
  )

  const handleToggleCollect = composeAuthedNavigation(
    useCallback(() => {
      if (topic.collected) {
        queryClient.setQueryData([`/page/t/:id/topic.json`, id.toString()], {
          ...topic,
          collected: false,
        })
        v2exClient
          .uncollectTopic({ id })
          .then(() => {
            alert.show({ type: 'success', message: '已取消收藏' })
          })
          .catch((err) => {
            queryClient.setQueryData(
              [`/page/t/:id/topic.json`, id.toString()],
              { ...topic, collected: true },
            )
            alert.show({ type: 'error', message: err.message })
          })
      } else {
        queryClient.setQueryData([`/page/t/:id/topic.json`, id.toString()], {
          ...topic,
          collected: true,
        })
        v2exClient
          .collectTopic({ id })
          .then(() => {
            alert.show({ type: 'success', message: '已加入收藏' })
          })
          .catch((err) => {
            queryClient.setQueryData(
              [`/page/t/:id/topic.json`, id.toString()],
              { ...topic, collected: false },
            )
            alert.show({ type: 'error', message: err.message })
          })
      }
    }, [id, topic?.collected]),
  )

  const handleThankTopic = composeAuthedNavigation(
    useCallback(() => {
      if (topic.thanked) {
        alert.show({ type: 'info', message: '已感谢过主题' })
        return
      }
      queryClient.setQueryData([`/page/t/:id/topic.json`, id.toString()], {
        ...topic,
        thanked: true,
      })
      v2exClient
        .thankTopic({ id })
        .then(() => {
          alert.show({ type: 'success', message: '已感谢主题' })
        })
        .catch((err) => {
          queryClient.setQueryData([`/page/t/:id/topic.json`, id.toString()], {
            ...topic,
            thanked: false,
          })
          alert.show({ type: 'error', message: err.message })
        })
    }, [id, topic?.thanked]),
  )

  const handleShare = useCallback(async () => {
    try {
      const url = `https://v2ex.com/t/${topic.id}`
      const message = topic.title || url
      await Share.open({ message, url })
    } catch (error) {
      console.log(error.message)
    }
  }, [topic])

  const isFocused = true

  const headerRight = useMemo(
    () => (
      <Button
        className='h-[44px] w-[44px] rounded-full'
        variant='icon'
        radius={22}
        onPress={() => {
          showActionSheetWithOptions(
            {
              title: `#${id}`,
              options: [
                '取消',
                '在内部 WebView 打开',
                topic?.blocked ? '取消忽略主题' : '忽略主题',
                '举报',
              ],
              cancelButtonIndex: 0,
              destructiveButtonIndex: 3,
              tintColor: styles.text_primary.color as string,
              userInterfaceStyle: colorScheme,
              containerStyle: {
                ...styles.layer1,
                paddingBlock: insets.bottom,
              },
              titleTextStyle: styles.text,
            },
            (buttonIndex) => {
              if (buttonIndex === 1) {
                router.push({
                  pathname: '/browser',
                  params: { url: getTopicLink(topicId) },
                })
              } else if (buttonIndex === 2) {
                handleToggleBlock()
              } else if (buttonIndex === 3) {
                handleReportTopic()
              }
            },
          )
        }}
      >
        <EllipsisHorizontalIcon size={24} color={styles.text.color} />
      </Button>
    ),
    [
      id,
      topic?.blocked,
      colorScheme,
      topicId,
      router,
      styles,
      showActionSheetWithOptions,
      handleToggleBlock,
      handleReportTopic,
    ],
  )

  const getReplyFormCacheKey = useCallback(
    (context: ReplyContext) => {
      if (settings.enableMultiMention) {
        return `$app$/topic-${context.type}:${id}`
      }
      return `$app$/topic-${context.type}:${id}/${context.target?.id || 'root'}`
    },
    [id, settings],
  )

  const submitReply = useCallback(
    async (context: ReplyContext, values: { content: string }) => {
      dismissReplyForm()
      const indicator = alert.show({
        type: 'default',
        message: '正在提交...',
        loading: true,
        duration: 0,
      })
      try {
        switch (context.type) {
          case 'reply':
            try {
              const { data: reply } = await v2exClient.postReply({
                id,
                content: values.content,
              })
              setMyReplies((prev) => [...prev, reply])
              const cacheKey = getReplyFormCacheKey(context)
              setJSON(cacheKey, undefined)
              alert.show({ type: 'success', message: '回复成功' })
            } catch (err) {
              alert.show({ type: 'error', message: err.message })
            }
            break
          case 'append':
            try {
              const { data: topic } = await v2exClient.appendTopic({
                id: topicId,
                content: values.content,
              })
              queryClient.setQueryData(
                [`/page/t/:id/topic.json`, id.toString()],
                topic,
              )
              const cacheKey = getReplyFormCacheKey(context)
              setJSON(cacheKey, undefined)
              alert.show({ type: 'success', message: '附言成功' })
            } catch (err) {
              alert.show({ type: 'error', message: err.message })
            }
        }
      } finally {
        alert.hide(indicator)
      }
    },
    [
      alert,
      dismissReplyForm,
      getReplyFormCacheKey,
      id,
      queryClient,
      setMyReplies,
      topicId,
    ],
  )

  const initReply = useCallback(
    (reply = null) => {
      const context = { target: reply, type: 'reply' } as ReplyContext
      showReplyForm({
        context,
        cacheKey: getReplyFormCacheKey(context),
        onSubmit: (values) => submitReply(context, values),
        onInitImgurSettings: () => {
          dismissReplyForm()
          router.push({
            pathname: '/imgur-settings',
            params: { autoBack: '1' },
          })
        },
      })
    },
    [
      showReplyForm,
      getReplyFormCacheKey,
      submitReply,
      dismissReplyForm,
      router,
    ],
  )

  const handleThankToReply = useCallback(
    (reply: TopicReply) => {
      const p = getPageNum(reply.num)
      v2exClient
        .thankReply({ id: reply.id })
        .then(({ data, success, message }) => {
          if (success) {
            alert.show({ type: 'success', message })
          } else {
            alert.show({ type: 'error', message })
          }

          queryClient.setQueryData(
            [`/page/t/:id/replies.json`, id],
            (currentData) => {
              const pages = currentData.pages
              const currentPageIndex = p - 1
              const currentPageData = pages[currentPageIndex]
              const targetIndex = pages[p - 1].data.findIndex(
                (item: TopicReply) => item.id === reply.id,
              )
              const currentReply = pages[p - 1].data[targetIndex]

              const newPageData = {
                ...currentPageData,
                data: [
                  ...currentPageData.data.slice(0, targetIndex),
                  { ...currentReply, ...data },
                  ...currentPageData.data.slice(targetIndex + 1),
                ],
              }

              return {
                pages: [
                  ...pages.slice(0, currentPageIndex),
                  newPageData,
                  ...pages.slice(currentPageIndex + 1),
                ],
                pageParams: currentData.pageParams,
              }
            },
          )
        })
        .catch((err) => {
          alert.show({ type: 'error', message: err.message })
        })
    },
    [id],
  )

  const handleAppend = useCallback(() => {
    const context = { type: 'append' } as ReplyContext
    showReplyForm({
      context,
      cacheKey: getReplyFormCacheKey(context),
      onSubmit: (values) => submitReply(context, values),
      onInitImgurSettings: () => {
        dismissReplyForm()
        router.push({ pathname: '/imgur-settings', params: { autoBack: '1' } })
      },
    })
  }, [
    showReplyForm,
    getReplyFormCacheKey,
    submitReply,
    dismissReplyForm,
    router,
  ])

  const handleEdit = useCallback(() => {
    if (topic) {
      router.push({ pathname: '/topic/[id]/edit', params: { id: topic.id } })
    }
  }, [topic, router])

  const handleChangeNode = useCallback(() => {
    changeNodeModalRef.current?.present()
  }, [])

  const handleRefetch = useCallback(() => {
    topicQuery.refetch()
  }, [])

  const openUserInfo = useCallback(
    (context: UserInfoContext) => {
      showUserInfo({
        data: getMemberReplies(context.data, replyItems),
        header: (
          <SimpleMemberInfo currentUser={currentUser} username={context.data} />
        ),
        showAvatar: settings.feedShowAvatar,
        onReply: initReply,
        onThank: handleThankToReply,
      })
    },
    [
      showUserInfo,
      replyItems,
      currentUser,
      settings.feedShowAvatar,
      initReply,
      handleThankToReply,
    ],
  )

  const openConversation = useCallback(
    (context: ConversationContext) => {
      showConversation({
        data: getRelatedReplies(context.data, replyItems),
        pivot: context.data,
        showAvatar: settings.feedShowAvatar,
        onReply: initReply,
        onThank: handleThankToReply,
        onShowUserInfo: openUserInfo,
      })
    },
    [
      showConversation,
      replyItems,
      settings.feedShowAvatar,
      initReply,
      handleThankToReply,
      openUserInfo,
    ],
  )

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      dismissAll()
    })
    return unsubscribe
  }, [navigation, dismissAll])

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', function () {
      if (currentIndexRef.current > 10) {
        setLastIndex(currentIndexRef.current, true)
      } else {
        setLastIndex(undefined, true)
      }
    })
    return unsubscribe
  }, [navigation, topicQuery.data])

  // FIX: Stabilise mentionedUsers — derive a primitive key first so the Set
  // object is only recreated when the actual contents change, not on every
  // render caused by a new replyItems array reference.
  const mentionedUsersKey = useMemo(() => {
    const users = new Set<string>()
    if (replyItems) {
      for (const r of replyItems) {
        if (r?.members_mentioned) {
          for (const u of r.members_mentioned) {
            users.add(u)
          }
        }
      }
    }
    return [...users].sort().join(',')
  }, [replyItems])

  const mentionedUsers = useMemo(() => {
    const users = new Set<string>(
      mentionedUsersKey ? mentionedUsersKey.split(',') : [],
    )
    return users
  }, [mentionedUsersKey])

  const extraData = useMemo(
    () => ({
      repliesLength: replyItems.length,
      mentionedUsers,
      contentWidth,
    }),
    [replyItems.length, mentionedUsers, contentWidth],
  )

  // FIX: Use refs for callbacks passed into renderReply so that the memoized
  // render function never needs to be recreated when these callbacks change,
  // which would bypass ReplyRow's memo() wrapper.
  const initReplyRef = useRef(initReply)
  const handleThankToReplyRef = useRef(handleThankToReply)
  const openConversationRef = useRef(openConversation)
  const openUserInfoRef = useRef(openUserInfo)

  useEffect(() => {
    initReplyRef.current = initReply
  }, [initReply])
  useEffect(() => {
    handleThankToReplyRef.current = handleThankToReply
  }, [handleThankToReply])
  useEffect(() => {
    openConversationRef.current = openConversation
  }, [openConversation])
  useEffect(() => {
    openUserInfoRef.current = openUserInfo
  }, [openUserInfo])

  const { renderReply, keyExtractor } = useMemo(() => {
    return {
      renderReply({
        item,
        index,
        extraData,
      }: {
        item: any
        index: number
        extraData?: any
      }) {
        return (
          <ReplyRow
            isLast={index === extraData?.repliesLength - 1}
            style={styles.layer1}
            showAvatar={settings.feedShowAvatar}
            contentWidth={extraData?.contentWidth}
            data={item}
            onReply={(reply) => initReplyRef.current(reply)}
            onThank={(reply) => handleThankToReplyRef.current(reply)}
            hasConversation={
              !!item?.members_mentioned?.length ||
              !!(
                item?.member?.username &&
                extraData?.mentionedUsers.has(item.member.username)
              )
            }
            onShowConversation={(ctx) => openConversationRef.current(ctx)}
            onShowUserInfo={(ctx) => openUserInfoRef.current(ctx)}
          />
        )
      },
      keyExtractor(item: any, index: number) {
        return item?.id ? String(item.id) : `index-${index}`
      },
    }
    // FIX: deps are now only the truly stable values that affect how the row
    // is rendered structurally (style, avatar). Callbacks are handled via refs.
  }, [styles.layer1, settings.feedShowAvatar])

  const handleReachEnd = useCallback(() => {
    if (shouldLoadMore(repliesQuery)) {
      repliesQuery.fetchNextPage()
    }
  }, [repliesQuery])

  const handleNavTo = useCallback(
    (target: number) => {
      if (target === 0) {
        listRef.current.scrollToOffset({ offset: 0, animated: true })
        return
      }
      listRef.current.scrollToIndex({
        index: Math.min(target - 1, replyItems.length - 1),
        animated: true,
      })
    },
    [replyItems?.length],
  )

  const scrollY = useSharedValue(0)
  const lastOffsetY = useSharedValue(0)
  const scrollDirection = useSharedValue<'up' | 'down' | ''>('')

  const handleScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y
      if (isBouncingTop(e) || isBouncingBottom(e)) {
        return
      }
      const offsetY = e.contentOffset.y
      if (offsetY - lastOffsetY.value !== 0) {
        const direction = offsetY - lastOffsetY.value > 0 ? 'down' : 'up'
        scrollDirection.value = direction
        lastOffsetY.value = offsetY
      }
    },
  })

  // FIX: Stable callback — only writes to a ref so deps are [].
  // Passing an inline arrow here caused FlashList to remount the entire list
  // on every render.
  const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
    currentIndexRef.current = viewableItems[0]?.index
  }, [])

  if (topicQuery.error) {
    return (
      <>
        <AnimatedHeader scrollY={scrollY} />
        <View className='flex-1 items-center justify-center'>
          <Text style={styles.text}>{topicQuery.error.message}</Text>
          {(topicQuery.error as ApiError).code !== 'RESOURCE_ERROR' &&
            (topicQuery.error as ApiError).code !== 'NOT_FOUND' && (
              <Button
                label='重试'
                size='md'
                onPress={() => topicQuery.refetch()}
                className='mt-4'
                variant='primary'
              />
            )}
        </View>
      </>
    )
  }

  if (!topic) {
    return (
      <>
        <AnimatedHeader scrollY={scrollY} />
        <TopicSkeleton />
      </>
    )
  }

  const BarComponent = padLayout.active ? PadSidebar : BottomBar

  return (
    <>
      <AnimatedHeader
        scrollY={scrollY}
        title={topic?.title}
        headerRight={headerRight}
      />
      <AnimatedFlashList
        ref={listRef}
        className='flex-1'
        data={replyItems}
        extraData={extraData}
        renderItem={renderReply}
        keyExtractor={keyExtractor}
        ListHeaderComponent={
          <TopicBaseInfo
            isLoading={
              isLoading(topicQuery) ||
              (!topicQuery.data && isLoading(repliesQuery))
            }
            data={topicQuery.data}
            hasReply={!!replyItems.length}
            fallback={brief}
            contentWidth={contentWidth}
            onAppend={handleAppend}
            onEdit={handleEdit}
            onChangeNode={handleChangeNode}
            onRefetch={handleRefetch}
          />
        }
        ListFooterComponent={
          <CommonListFooter data={repliesQuery} emptyMessage='目前尚无回复' />
        }
        onEndReachedThreshold={0.4}
        onEndReached={handleReachEnd}
        // FIX: was an inline arrow function — caused FlashList to remount all
        // visible rows on every render. Now a stable useCallback with [] deps.
        onViewableItemsChanged={handleViewableItemsChanged}
        refreshControl={
          <MyRefreshControl
            refreshing={repliesQuery.isRefetching}
            onRefresh={repliesQuery.refetch}
          />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      {showScrollToLastPosition && (
        <ScrollToLastPosition
          className='absolute bottom-[100px] w-full flex items-center'
          onPress={() => {
            InteractionManager.runAfterInteractions(() => {
              listRef.current?.scrollToIndex({
                index: lastIndex,
                animated: true,
              })
            })
          }}
        />
      )}
      <BarComponent
        isFocused={isFocused}
        onInitReply={initReply}
        scrollControlRef={scrollControlRef}
        repliesCount={topic.replies}
        onNavTo={handleNavTo}
        collected={topic.collected}
        onToggleCollect={handleToggleCollect}
        thanked={topic.thanked}
        onThankTopic={handleThankTopic}
        onShare={handleShare}
      />
      <TopBottomNav
        repliesCount={topic.replies}
        onNavTo={handleNavTo}
        scrollDirection={scrollDirection}
      />

      {topicQuery.data?.canMove && (
        <TrueSheet
          ref={changeNodeModalRef}
          detents={['auto']}
          backgroundColor={styles.overlay.backgroundColor}
        >
          <View className='h-[280px] pt-4'>
            <TopicMovePanel
              topicId={topicQuery.data.id}
              node={topicQuery.data.node}
              onExit={() => {
                changeNodeModalRef.current?.dismiss()
              }}
              onUpdated={(topic) => {
                queryClient.setQueryData(
                  [`/page/t/:id/topic.json`, id.toString()],
                  topic,
                )
              }}
            />
          </View>
        </TrueSheet>
      )}
    </>
  )
}

export default TopicScreen
