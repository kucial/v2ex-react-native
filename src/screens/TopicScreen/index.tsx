import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { InteractionManager, Text, View } from 'react-native'
import { EllipsisHorizontalIcon } from 'react-native-heroicons/outline'
import {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated'
import Share from 'react-native-share'
// import { TagIcon } from 'react-native-heroicons/outline'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useIsFocused } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { FlashList } from '@shopify/flash-list'
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import AnimatedFlashList from '@/components/AnimatedFlashList'
import AnimatedHeader from '@/components/AnimatedHeader'
import Button from '@/components/Button'
import CommonListFooter from '@/components/CommonListFooter'
import MyBottomSheetModal from '@/components/MyBottomSheetModal'
import MyRefreshControl from '@/components/MyRefreshControl'
import TopicSkeleton from '@/components/Skeleton/TopicSkeleton'
import { useAlertService } from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { usePadLayout } from '@/containers/AppSettingsService'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'
import { useViewedTopics } from '@/containers/ViewedTopicsService'
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
import ReplyList from './ReplyList'
import ReplyRow from './ReplyRow'
import { ScrollControlApi } from './ScrollControl'
import ScrollToLastPosition from './ScrollToLastPosition'
import SimpleMemberInfo from './SimpleMemberInfo'
import TopBottomNav from './TopBottomNav'
import TopicBaseInfo from './TopicBaseInfo'
import TopicMovePanel from './TopicMovePanel'
import TopicReplyForm from './TopicReplyForm'
import { ConversationContext, UserInfoContext } from './types'

const REPLY_PAGE_SIZE = 100
const getPageNum = (num: number) => Math.ceil(num / REPLY_PAGE_SIZE)
const getTopicLink = (id: string | number) => `https://v2ex.com/t/${id}`

const replyModalSnapPoints = [220]
const moveModalSnapPoints = [280]
const conversationSnapPoints = ['60%', '90%']

const hasRelatedMessages = (reply, replyList) => {
  if (!reply) {
    return false
  }
  const memberName = reply.member.username
  return (
    !!reply.members_mentioned.length ||
    replyList.some((r) => r.members_mentioned.includes(memberName))
  )
}

const getMemberReplies = (pivot: string, replyList: TopicReply[]) => {
  return replyList.filter((item) => item.member.username === pivot)
}

type ReplyContext = {
  type: 'reply' | 'append'
  target?: TopicReply
}

type TopicScreenProps = NativeStackScreenProps<AppStackParamList, 'topic'>

function TopicScreen({ navigation, route }: TopicScreenProps) {
  const {
    params: { brief, id },
  } = route

  const alert = useAlertService()
  const queryClient = useQueryClient()
  const topicQuery = useQuery({
    queryKey: [`/page/t/:id/topic.json`, id],
    queryFn: async () => {
      const { data } = await v2exClient.getTopicDetail({ id })
      return data
    },
    refetchOnMount: false,
  })

  const topic = topicQuery.data || (brief as TopicDetail)

  const { touchViewed } = useViewedTopics()
  const [lastIndex, setLastIndex] = useCachedState(
    `$app$/topic/${route.params.id}/last-position`,
    null,
  )
  const [showScrollToLastPosition, setShowScrollToLastPosition] =
    useState(false)

  const fetchReplies = useCallback(
    async ({ pageParam }) => {
      const data = await v2exClient.getTopicReplies({ id, p: pageParam })
      // side effects...
      if (data.meta?.topic) {
        queryClient.setQueryData(
          [`/page/t/:id/topic.json`, id],
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
      // trigger once.
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

  const [conversationContext, setConversationContext] =
    useState<ConversationContext>(null)
  const [userInfoContext, setUserInfoContext] = useState<UserInfoContext>(null)

  const { data: settings } = useAppSettings()
  const padLayout = usePadLayout()

  const listRef = useRef<FlashList<TopicReply>>()
  const replyModalRef = useRef<BottomSheetModal>()
  const conversationModalRef = useRef<BottomSheetModal>()
  const userInfoModalRef = useRef<BottomSheetModal>()
  const changeNodeModalRef = useRef<BottomSheetModal>()
  const scrollControlRef = useRef<ScrollControlApi>(null)
  const currentIndexRef = useRef(null)
  const [myReplies, setMyReplies] = useCachedState<TopicReply[]>(
    `my-topic-replies:${id}`,
    [],
  )

  const { composeAuthedNavigation, user: currentUser } = useAuthService()

  const { styles, colorScheme } = useTheme()

  const replyItems = useMemo(() => {
    if (repliesQuery.isLoading && !repliesQuery.error) {
      // initial loading
      return new Array(10)
    }
    const items =
      repliesQuery.data?.pages.reduce((combined, page) => {
        if (page.data) {
          return [...combined, ...page.data]
        }
        return combined
      }, myReplies) || []

    items.sort((a, b) => a.num - b.num)
    return items
  }, [repliesQuery, myReplies])

  // cleanup replies.
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
  }, [repliesQuery.data?.pages, myReplies])

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

      request({
        id,
      })
        .then(({ data }) => {
          topicQuery.data &&
            queryClient.setQueryData([`/page/t/:id/topic.json`, id], {
              ...topicQuery.data,
              ...data,
            })
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
            queryClient.setQueryData([`/page/t/:id/topic.json`, id], {
              ...topicQuery.data,
              ...data,
            })
          if (data.reported) {
            alert.show({ type: 'success', message: '已举报主题' })
          } else {
            alert.show({
              type: 'error',
              message: '未成功举报举报主题',
            })
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

  // TODO: rewrite with swr optimistic update
  const handleToggleCollect = composeAuthedNavigation(
    useCallback(() => {
      if (topic.collected) {
        queryClient.setQueryData([`/page/t/:id/topic.json`, id], {
          ...topic,
          collected: false,
        })
        v2exClient
          .uncollectTopic({
            id,
          })
          .then(() => {
            alert.show({
              type: 'success',
              message: '已取消收藏',
            })
          })
          .catch((err) => {
            queryClient.setQueryData([`/page/t/:id/topic.json`, id], {
              ...topic,
              collected: true,
            })
            alert.show({ type: 'error', message: err.message })
          })
      } else {
        queryClient.setQueryData([`/page/t/:id/topic.json`, id], {
          ...topic,
          collected: true,
        })
        v2exClient
          .collectTopic({
            id,
          })
          .then(() => {
            alert.show({
              type: 'success',
              message: '已加入收藏',
            })
          })
          .catch((err) => {
            queryClient.setQueryData([`/page/t/:id/topic.json`, id], {
              ...topic,
              collected: false,
            })
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
      queryClient.setQueryData([`/page/t/:id/topic.json`, id], {
        ...topic,
        thanked: true,
      })
      v2exClient
        .thankTopic({
          id,
        })
        .then(() => {
          alert.show({
            type: 'success',
            message: '已感谢主题',
          })
        })
        .catch((err) => {
          queryClient.setQueryData([`/page/t/:id/topic.json`, id], {
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
      await Share.open({
        message,
        url,
      })
    } catch (error) {
      console.log(error.message)
    }
  }, [topic])

  const isFocused = useIsFocused()

  const headerRight = useMemo(
    () => (
      <Button
        className="h-[44px] w-[44px] rounded-full"
        variant="icon"
        radius={22}
        onPress={() => {
          // actionsheet
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
              containerStyle: styles.layer1,
              titleTextStyle: styles.text,
            },
            (buttonIndex) => {
              if (buttonIndex === 1) {
                navigation.push('browser', {
                  url: getTopicLink(id),
                })
              } else if (buttonIndex === 2) {
                handleToggleBlock()
              } else if (buttonIndex === 3) {
                handleReportTopic()
              }
            },
          )
        }}>
        <EllipsisHorizontalIcon size={24} color={styles.text.color} />
      </Button>
    ),
    [id, topic?.blocked, colorScheme],
  )

  const [replyContext, setReplyContext] = useState<ReplyContext>(null)
  const initReply = useCallback(
    (reply = null) => {
      setReplyContext({ target: reply, type: 'reply' })
      replyModalRef.current?.present()
    },
    [id],
  )
  const getReplyFormCacheKey = useCallback(
    (context: ReplyContext) => {
      if (settings.enableMultiMention) {
        return `$app$/topic-${context.type}:${id}`
      }
      return `$app$/topic-${context.type}:${id}/${context.target?.id || 'root'}`
    },
    [id, replyContext, settings],
  )

  const handleThankToReply = useCallback(
    (reply: TopicReply) => {
      const p = getPageNum(reply.num)
      v2exClient
        .thankReply({
          id: reply.id,
        })
        .then(({ data, success, message }) => {
          if (success) {
            alert.show({
              type: 'success',
              message,
            })
          } else {
            alert.show({ type: 'error', message: message })
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
          alert.show({
            type: 'error',
            message: err.message,
          })
        })
    },
    [id],
  )

  const handleSubmitReply = useCallback(
    async (values: { content: string }) => {
      replyModalRef.current?.dismiss()
      setReplyContext(null)
      const indicator = alert.show({
        type: 'default',
        message: '正在提交...',
        loading: true,
        duration: 0,
      })
      try {
        switch (replyContext.type) {
          case 'reply':
            try {
              const { data: reply } = await v2exClient.postReply({
                id,
                content: values.content,
              })
              setMyReplies((prev) => [...prev, reply])
              // clear cached for reply form.
              const cacheKey = getReplyFormCacheKey(replyContext)
              setJSON(cacheKey, undefined)
              alert.show({ type: 'success', message: '回复成功' })
            } catch (err) {
              alert.show({ type: 'error', message: err.message })
            }
            break
          case 'append':
            try {
              const { data: topic } = await v2exClient.appendTopic({
                id,
                content: values.content,
              })
              queryClient.setQueryData([`/page/t/:id/topic.json`, id], topic)
              const cacheKey = getReplyFormCacheKey(replyContext)
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
    [id, replyContext],
  )

  const handleAppend = useCallback(() => {
    setReplyContext({
      type: 'append',
    })
    replyModalRef.current?.present()
  }, [])

  const handleEdit = useCallback(() => {
    navigation.push('edit-topic', {
      id: topic?.id,
    })
  }, [topic?.id])

  const handleChangeNode = useCallback(() => {
    changeNodeModalRef.current?.present()
  }, [])

  const handleRefetch = useCallback(() => {
    topicQuery.refetch()
  }, [])

  const showConversation = useCallback((context: ConversationContext) => {
    setConversationContext(context)
    conversationModalRef.current?.present()
  }, [])

  const showUserInfo = useCallback((context: UserInfoContext) => {
    setUserInfoContext(context)
    userInfoModalRef.current?.present()
  }, [])

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      conversationModalRef.current?.dismiss()
      userInfoModalRef.current?.dismiss()
    })
    return unsubscribe
  }, [navigation])

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

  const { renderReply, keyExtractor } = useMemo(() => {
    return {
      renderReply({ item, index }) {
        return (
          <ReplyRow
            isLast={index === replyItems.length - 1}
            style={styles.layer1}
            showAvatar={settings.feedShowAvatar}
            navigation={navigation}
            data={item}
            onReply={initReply}
            onThank={handleThankToReply}
            hasConversation={hasRelatedMessages(item, replyItems)}
            onShowConversation={showConversation}
            onShowUserInfo={showUserInfo}
          />
        )
      },
      keyExtractor(item, index: number) {
        return item?.id || `index-${index}`
      },
    }
  }, [id, replyItems])

  const handleReachEnd = useCallback(() => {
    if (shouldLoadMore(repliesQuery)) {
      repliesQuery.fetchNextPage()
    }
  }, [repliesQuery, topicQuery])

  const handleNavTo = useCallback(
    (target: number) => {
      if (target === 0) {
        listRef.current.scrollToOffset({
          offset: 0,
          animated: true,
        })
        return
      }
      listRef.current.scrollToIndex({
        index: Math.min(target - 1, replyItems.length - 1),
        animated: true,
      })
    },
    [replyItems?.length],
  )

  const conversation = useMemo(() => {
    if (!conversationContext) {
      return null
    }
    return getRelatedReplies(conversationContext.data, replyItems)
  }, [conversationContext, replyItems])

  const userPostedMessages = useMemo(() => {
    if (!userInfoContext) {
      return null
    }
    return getMemberReplies(userInfoContext.data, replyItems)
  }, [userInfoContext, replyItems])

  const scrollY = useSharedValue(0)
  const lastOffsetY = useSharedValue(0)
  const scrollDirection = useSharedValue('')

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

  if (topicQuery.error) {
    return (
      <>
        <AnimatedHeader scrollY={scrollY} />
        <View className="flex-1 items-center justify-center">
          <Text style={styles.text}>{topicQuery.error.message}</Text>
          {(topicQuery.error as ApiError).code !== 'RESOURCE_ERROR' &&
            (topicQuery.error as ApiError).code !== 'NOT_FOUND' && (
              <Button
                label="重试"
                size="md"
                onPress={() => topicQuery.refetch()}
                className="mt-4"
                variant="primary"
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
        className="flex-1"
        data={replyItems}
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
            navigation={navigation}
            onAppend={handleAppend}
            onEdit={handleEdit}
            onChangeNode={handleChangeNode}
            onRefetch={handleRefetch}
          />
        }
        ListFooterComponent={
          <CommonListFooter data={repliesQuery} emptyMessage="目前尚无回复" />
        }
        estimatedItemSize={140}
        onEndReachedThreshold={0.4}
        onEndReached={handleReachEnd}
        onViewableItemsChanged={({ viewableItems }) => {
          const item = viewableItems[0]
          currentIndexRef.current = item?.index
        }}
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
          style={{
            position: 'absolute',
            bottom: 110,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
          }}
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

      <MyBottomSheetModal
        ref={conversationModalRef}
        index={0}
        snapPoints={conversationSnapPoints}>
        {conversationContext && (
          <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 44 }}>
            <ReplyList
              showAvatar={settings.feedShowAvatar}
              navigation={navigation}
              data={conversation}
              pivot={conversationContext.data}
              onReply={initReply}
              onThank={handleThankToReply}
              onShowUserInfo={showUserInfo}
            />
          </BottomSheetScrollView>
        )}
      </MyBottomSheetModal>
      <MyBottomSheetModal
        ref={userInfoModalRef}
        index={0}
        snapPoints={conversationSnapPoints}>
        {userInfoContext && (
          <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 44 }}>
            <ReplyList
              showAvatar={settings.feedShowAvatar}
              navigation={navigation}
              data={userPostedMessages}
              header={
                <SimpleMemberInfo
                  currentUser={currentUser}
                  username={userInfoContext.data}
                  navigation={navigation}
                />
              }
              onReply={initReply}
              onThank={handleThankToReply}
            />
          </BottomSheetScrollView>
        )}
      </MyBottomSheetModal>

      <MyBottomSheetModal
        ref={replyModalRef}
        index={0}
        snapPoints={replyModalSnapPoints}>
        {replyContext && (
          <TopicReplyForm
            cacheKey={getReplyFormCacheKey(replyContext)}
            context={replyContext}
            onSubmit={handleSubmitReply}
            onInitImgurSettings={() => {
              replyModalRef.current?.dismiss()
              navigation.push('imgur-settings', {
                autoBack: true,
              })
            }}
          />
        )}
      </MyBottomSheetModal>
      {topicQuery.data?.canMove && (
        <MyBottomSheetModal
          ref={changeNodeModalRef}
          index={0}
          snapPoints={moveModalSnapPoints}>
          <TopicMovePanel
            topicId={topicQuery.data.id}
            node={topicQuery.data.node}
            onExit={() => {
              changeNodeModalRef.current?.dismiss()
            }}
            onUpdated={(topic) => {
              queryClient.setQueryData([`/page/t/:id/topic.json`, id], topic)
            }}
          />
        </MyBottomSheetModal>
      )}
    </>
  )
}

export default memo(TopicScreen)
