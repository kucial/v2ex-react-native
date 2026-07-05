import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  InteractionManager,
  StyleSheet,
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
import {
  InfiniteData,
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
import { AlertService } from '@/containers/AlertService/types'
import {
  useAppSettings,
  useMaxContainerWidth,
  usePadLayout,
} from '@/containers/AppSettingsService'
import { useComposeAuthedNavigation } from '@/containers/AuthWatcher/hooks'
import { useTheme } from '@/containers/ThemeService'
import { useTouchViewedTopic } from '@/containers/ViewedTopicsService'
import { useCurrentUser } from '@/stores/auth'
import { useTopicSheetStore } from '@/stores/topicSheet'
import { getRelatedReplies } from '@/utils/content'
import { useCachedState } from '@/utils/hooks'
import { isLoading } from '@/utils/react-query'
import { isBouncingBottom, isBouncingTop } from '@/utils/scroll'
import { setJSON } from '@/utils/storage'
import { dismissSheet, presentSheet } from '@/utils/trueSheet'
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

type TopicRepliesPage = v2exClient.TopicRepliesResponse

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error)

function TopicScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  const { id: rawId, brief: rawBrief } = params
  const id = (Array.isArray(rawId) ? rawId[0] : rawId) ?? ''
  const topicId = Number(id)
  const brief = Array.isArray(rawBrief)
    ? rawBrief[0]
    : rawBrief
      ? JSON.parse(rawBrief)
      : undefined

  const alert = useAlertService() as AlertService
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
  const [lastIndex, setLastIndex] = useCachedState<number>(
    `$app$/topic/${id}/last-position`,
    0,
  )
  const [showScrollToLastPosition, setShowScrollToLastPosition] =
    useState(false)

  const fetchReplies = useCallback(
    async ({ pageParam }: { pageParam: number }) => {
      const data = await v2exClient.getTopicReplies({ id, p: pageParam })
      if (data.meta?.topic) {
        queryClient.setQueryData(
          [`/page/t/:id/topic.json`, id.toString()],
          data.meta.topic,
        )
      }
      return data
    },
    [id, queryClient],
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
  // FIX: Only depend on topicQuery.data and lastIndex.
  // - showScrollToLastPosition was in deps but is also SET inside this effect,
  //   causing it to re-run every time it flipped to true (loop).
  // - touchViewed should only fire once per topic load; guard with a ref.
  const touchViewedCalledRef = useRef(false)
  useEffect(() => {
    if (topicQuery.data) {
      if (lastIndex && !showScrollToLastPosition) {
        setShowScrollToLastPosition(true)
      }
      if (!touchViewedCalledRef.current) {
        touchViewedCalledRef.current = true
        setTimeout(() => {
          touchViewed(topicQuery.data)
        }, 500)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicQuery.data, lastIndex])

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
  const currentIndexRef = useRef<number>(0)
  const [myReplies, setMyReplies] = useCachedState<TopicReply[]>(
    `my-topic-replies:${id}`,
    [],
  )
  const myRepliesRef = useRef(myReplies)
  useEffect(() => {
    myRepliesRef.current = myReplies
  }, [myReplies])

  const composeAuthedNavigation = useComposeAuthedNavigation()
  const currentUser = useCurrentUser()
  const {
    showConversation,
    showUserInfo,
    showReplyForm,
    dismissReplyForm,
    dismissAll,
  } = useTopicSheetStore()

  const { styles, colorScheme } = useTheme()

  const replyItems = useMemo(() => {
    if (repliesQuery.isLoading && !repliesQuery.error) {
      return new Array(10)
    }
    const items: TopicReply[] = [...myReplies]
    if (repliesQuery.data?.pages) {
      for (const page of repliesQuery.data.pages) {
        if (page.data) {
          items.push(...page.data)
        }
      }
    }

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
    const currentMyReplies = myRepliesRef.current
    if (currentMyReplies.length && repliesQuery.data) {
      for (let i = 0; i < currentMyReplies.length; i += 1) {
        let loaded = false
        const myReply = currentMyReplies[i]
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
            const index = prev.findIndex((item) => item.id === myReply.id)
            if (index > -1) {
              return [...prev.slice(0, index), ...prev.slice(index + 1)]
            }
            return prev
          })
        }
      }
    }
    // FIX: Use repliesQuery.data?.pages, not repliesQuery.data.
    // repliesQuery.data is a brand-new object reference on every background
    // refetch/isFetching flip, causing this effect to run far too often and
    // spam setMyReplies calls. data.pages only changes when a new page loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repliesQuery.data?.pages, setMyReplies])

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
          if (!data) {
            return
          }
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
          alert.show({ type: 'error', message: getErrorMessage(err) })
        })
        .finally(() => {
          alert.hide(indicator)
        })
    }, [id, topic?.blocked, alert, queryClient, topicQuery.data]),
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
          if (!data) {
            return
          }
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
          alert.show({ type: 'error', message: getErrorMessage(err) })
        })
        .finally(() => {
          alert.hide(indicator)
        })
    }, [id, alert, queryClient, topicQuery.data]),
  )

  const handleToggleCollect = composeAuthedNavigation(
    useCallback(() => {
      if (!topic) {
        return
      }
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
            alert.show({ type: 'error', message: getErrorMessage(err) })
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
            alert.show({ type: 'error', message: getErrorMessage(err) })
          })
      }
    }, [id, topic, alert, queryClient]),
  )

  const handleThankTopic = composeAuthedNavigation(
    useCallback(() => {
      if (!topic) {
        return
      }
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
          alert.show({ type: 'error', message: getErrorMessage(err) })
        })
    }, [id, topic, alert, queryClient]),
  )

  const handleShare = useCallback(async () => {
    if (!topic) {
      return
    }
    try {
      const url = `https://v2ex.com/t/${topic.id}`
      const message = topic.title || url
      await Share.open({ message, url })
    } catch (error) {
      console.log(getErrorMessage(error))
    }
  }, [topic])

  const isFocused = true

  const headerRight = useMemo(
    () => (
      <Button
        style={screenStyles.headerButton}
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
      insets.bottom,
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
              if (reply) {
                setMyReplies((prev) => [...prev, reply])
              }
              const cacheKey = getReplyFormCacheKey(context)
              setJSON(cacheKey, undefined)
              alert.show({ type: 'success', message: '回复成功' })
            } catch (err) {
              alert.show({ type: 'error', message: getErrorMessage(err) })
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
              alert.show({ type: 'error', message: getErrorMessage(err) })
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
    (reply?: TopicReply) => {
      const context: ReplyContext = { target: reply, type: 'reply' }
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
            (currentData: InfiniteData<TopicRepliesPage> | undefined) => {
              if (!currentData || !data) {
                return currentData
              }
              const pages = currentData.pages
              const currentPageIndex = p - 1
              const currentPageData = pages[currentPageIndex]
              if (!currentPageData) {
                return currentData
              }
              const targetIndex = pages[p - 1].data.findIndex(
                (item: TopicReply) => item.id === reply.id,
              )
              if (targetIndex < 0) {
                return currentData
              }
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
          alert.show({ type: 'error', message: getErrorMessage(err) })
        })
    },
    [id, alert, queryClient],
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
    presentSheet(changeNodeModalRef.current)
  }, [])

  // FIX: Use topicQuery.refetch (stable function) not topicQuery (new object
  // on every render) — otherwise handleRefetch is recreated on every render.
  const handleRefetch = useCallback(() => {
    topicQuery.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicQuery.refetch])

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
        setLastIndex(0, true)
      }
    })
    return unsubscribe
  }, [navigation, topicQuery.data, setLastIndex])

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

  // FIX: Create stable callback bridges ONCE. These read the latest function
  // from the ref on each invocation, so they never need to be recreated.
  // Previously we were passing `(reply) => initReplyRef.current(reply)` inline
  // inside renderReply, which created 4 new function objects on every list
  // render — completely defeating memo(ReplyRow).
  const stableOnReply = useCallback(
    (reply: any) => initReplyRef.current(reply),
    [],
  )
  const stableOnThank = useCallback(
    (reply: any) => handleThankToReplyRef.current(reply),
    [],
  )
  const stableOnShowConversation = useCallback(
    (ctx: any) => openConversationRef.current(ctx),
    [],
  )
  const stableOnShowUserInfo = useCallback(
    (ctx: any) => openUserInfoRef.current?.(ctx),
    [],
  )

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
            onReply={stableOnReply}
            onThank={stableOnThank}
            hasConversation={
              !!item?.members_mentioned?.length ||
              !!(
                item?.member?.username &&
                extraData?.mentionedUsers.has(item.member.username)
              )
            }
            onShowConversation={stableOnShowConversation}
            onShowUserInfo={stableOnShowUserInfo}
          />
        )
      },
      keyExtractor(item: any, index: number) {
        return item?.id ? String(item.id) : `index-${index}`
      },
    }
    // FIX: deps are now only the truly stable values that affect how the row
    // is rendered structurally (style, avatar). Callbacks are stable refs.
  }, [
    styles.layer1,
    settings.feedShowAvatar,
    stableOnReply,
    stableOnThank,
    stableOnShowConversation,
    stableOnShowUserInfo,
  ])

  const {
    error: repliesError,
    fetchNextPage: fetchNextRepliesPage,
    hasNextPage: hasMoreReplies,
    isFetchingNextPage: isFetchingNextRepliesPage,
    isRefetching: isRefetchingReplies,
    refetch: refetchReplies,
  } = repliesQuery

  const handleReachEnd = useCallback(() => {
    if (hasMoreReplies && !isFetchingNextRepliesPage && !repliesError) {
      fetchNextRepliesPage()
    }
  }, [
    fetchNextRepliesPage,
    hasMoreReplies,
    isFetchingNextRepliesPage,
    repliesError,
  ])

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
  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    currentIndexRef.current = viewableItems[0]?.index ?? 0
  }, [])

  const isTopicHeaderLoading =
    isLoading(topicQuery) || (!topicQuery.data && isLoading(repliesQuery))

  const listHeader = useMemo(
    () => (
      <TopicBaseInfo
        isLoading={isTopicHeaderLoading}
        data={topicQuery.data}
        hasReply={!!replyItems.length}
        fallback={brief}
        contentWidth={contentWidth}
        onAppend={handleAppend}
        onEdit={handleEdit}
        onChangeNode={handleChangeNode}
        onRefetch={handleRefetch}
      />
    ),
    [
      brief,
      contentWidth,
      handleAppend,
      handleChangeNode,
      handleEdit,
      handleRefetch,
      isTopicHeaderLoading,
      replyItems.length,
      topicQuery.data,
    ],
  )

  const listFooter = useMemo(
    () => <CommonListFooter data={repliesQuery} emptyMessage='目前尚无回复' />,
    [repliesQuery],
  )

  const refreshControl = useMemo(
    () => (
      <MyRefreshControl
        refreshing={isRefetchingReplies}
        onRefresh={refetchReplies}
      />
    ),
    [isRefetchingReplies, refetchReplies],
  )

  if (topicQuery.error) {
    return (
      <>
        <AnimatedHeader scrollY={scrollY} />
        <View style={screenStyles.errorContainer}>
          <Text style={styles.text}>{topicQuery.error.message}</Text>
          {(topicQuery.error as ApiError).code !== 'RESOURCE_ERROR' &&
            (topicQuery.error as ApiError).code !== 'NOT_FOUND' && (
              <Button
                label='重试'
                size='md'
                onPress={() => topicQuery.refetch()}
                style={screenStyles.mt4}
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
        style={screenStyles.list}
        data={replyItems}
        extraData={extraData}
        renderItem={renderReply}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        onEndReachedThreshold={0.4}
        onEndReached={handleReachEnd}
        // FIX: was an inline arrow function — caused FlashList to remount all
        // visible rows on every render. Now a stable useCallback with [] deps.
        onViewableItemsChanged={handleViewableItemsChanged}
        refreshControl={refreshControl}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      {showScrollToLastPosition && (
        <ScrollToLastPosition
          style={screenStyles.scrollToLast}
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
        collected={!!topic.collected}
        onToggleCollect={handleToggleCollect}
        thanked={!!topic.thanked}
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
          <View style={screenStyles.movePanelContainer}>
            <TopicMovePanel
              topicId={topicQuery.data.id}
              node={topicQuery.data.node}
              onExit={() => {
                dismissSheet(changeNodeModalRef.current)
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

const screenStyles = StyleSheet.create({
  headerButton: {
    height: 44,
    width: 44,
    borderRadius: 22,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mt4: {
    marginTop: 16,
  },
  list: {
    flex: 1,
  },
  scrollToLast: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    alignItems: 'center',
  },
  movePanelContainer: {
    height: 280,
    paddingTop: 16,
  },
})

export default TopicScreen
