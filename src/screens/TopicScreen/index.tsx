import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Share } from 'react-native'
import { InteractionManager } from 'react-native'
import { EllipsisHorizontalIcon } from 'react-native-heroicons/outline'
import {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated'
// import { TagIcon } from 'react-native-heroicons/outline'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useIsFocused } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { FlashList } from '@shopify/flash-list'
import deepmerge from 'deepmerge'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

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
import { useCachedState } from '@/utils/hooks'
import { isBouncingBottom, isBouncingTop } from '@/utils/scroll'
import { setJSON } from '@/utils/storage'
import { isLoading, isRefreshing, shouldLoadMore } from '@/utils/swr'
import * as v2exClient from '@/utils/v2ex-client'
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
const isIntersected = (arrA, arrB) =>
  new Set([...arrA, ...arrB]).size < new Set(arrA).size + new Set(arrB).size

const getRelatedReplies = (pivot: TopicReply, replyList: TopicReply[]) => {
  const list = [pivot]
  const beforePivotReplies = replyList.slice(0, pivot.num - 1)
  const afterPivotReplies = replyList.slice(pivot.num)

  const conversationUsers = new Set(pivot.members_mentioned)
  conversationUsers.add(pivot.member.username)

  /**
   * Pivot 之前的回复
   * 沿路查查中 被 mention 相关的回复，如果被 mention 的回复为 `root` 回复，则继续查找 回复作者的其他 `root` 回复
   */
  const beforeMetionInWay = new Set(pivot.members_mentioned)
  const rootReplyUsers = new Set()
  const repliedToNums = new Set(pivot.replied_to)
  if (!pivot.members_mentioned.length) {
    rootReplyUsers.add(pivot.member.username)
  }

  beforePivotReplies.reverse().forEach((r) => {
    if (repliedToNums.size) {
      if (r.num > Math.max(...repliedToNums)) {
        return
      } else if (repliedToNums.has(r.num)) {
        repliedToNums.delete(r.num)
        if (r.replied_to) {
          r.replied_to.forEach((num) => {
            repliedToNums.add(num)
          })
        } else if (r.members_mentioned.length) {
          r.members_mentioned.forEach((username) => {
            beforeMetionInWay.add(username)
            conversationUsers.add(username)
          })
        } else {
          rootReplyUsers.add(r.member.username)
        }
        list.unshift(r)
        return
      }
    }
    // 根评论用户发表的其他根评论
    if (rootReplyUsers.has(r.member.username) && !r.members_mentioned.length) {
      list.unshift(r)
      return
    }

    if (beforeMetionInWay.has(r.member.username)) {
      beforeMetionInWay.delete(r.member.username)
      if (r.members_mentioned.length) {
        r.members_mentioned.forEach((username) => {
          beforeMetionInWay.add(username)
          conversationUsers.add(username)
        })
      } else {
        rootReplyUsers.add(r.member.username)
      }
      list.unshift(r)
      return
    }
  })

  // Pivot 之后的回复
  // 1. pivot 有 members_mentioned 用户， 则只包含 pivot member 与 members_mentioned 之间回复
  // 2. pivot 没有 members_mentioned 用户，则包含后续 向 pivot member 进行的回复
  const afterMentionInWay = new Set(pivot.members_mentioned)
  const pivotIsRootReply = !pivot.members_mentioned.length
  afterPivotReplies.forEach((r) => {
    // pivot 是根评论， r 也是来自同一用户的根评论
    if (
      pivotIsRootReply &&
      !r.members_mentioned.length &&
      r.member.username === pivot.member.username
    ) {
      list.push(r)
      return
    }

    // pivot 是根评论，其他用户回复这个 pivot 用户
    if (
      pivotIsRootReply &&
      r.members_mentioned.includes(pivot.member.username)
    ) {
      afterMentionInWay.add(r.member.username)
      list.push(r)
      return
    }

    if (
      // pivot member replied to others
      (r.member.username === pivot.member.username &&
        isIntersected(r.members_mentioned, afterMentionInWay)) ||
      // others replied to pivot member
      (afterMentionInWay.has(r.member.username) &&
        r.members_mentioned.includes(pivot.member.username))
    ) {
      list.push(r)
    }
  })

  return list
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
  const topicSwr = useSWR(
    [`/page/t/:id/topic.json`, id],
    async ([_, id]) => {
      const { data } = await v2exClient.getTopicDetail({ id })
      return data
    },
    {
      revalidateIfStale: false,
      revalidateOnMount: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  )

  const topic = topicSwr.data || (brief as TopicDetail)

  const { touchViewed } = useViewedTopics()
  const [lastIndex, setLastIndex] = useCachedState(
    `$app$/topic/${route.params.id}/last-position`,
    null,
  )
  const [showScrollToLastPosition, setShowScrollToLastPosition] =
    useState(false)

  const listSwr = useSWRInfinite(
    useCallback(
      (index): [string, number, number] => {
        return [`/page/t/:id/replies.json`, id, index + 1]
      },
      [id],
    ),
    async ([_, id, page]) => {
      const data = await v2exClient.getTopicReplies({ id, p: page })
      if (data.meta?.topic) {
        topicSwr.mutate(
          (prev) =>
            deepmerge(prev, data.meta.topic, {
              arrayMerge: (a, b) => b,
            }),
          false,
        )
      }
      return data
    },
    {
      // initialSize: Math.max(1, Math.ceil((topic?.replies || 0) / 100)),
      revalidateOnMount: true,
      revalidateOnFocus: false,
      onSuccess: (data) => {
        const topic = data[data.length - 1]?.meta?.topic
        if (topic) {
          setTimeout(() => {
            touchViewed(topic)
          }, 500)
        }
        if (lastIndex && !showScrollToLastPosition) {
          setShowScrollToLastPosition(true)
        }
      },
      onErrorRetry(err) {
        if (err.code === 'RESOURCE_ERROR') {
          return
        }
      },
    },
  )

  const { showActionSheetWithOptions } = useActionSheet()

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

  const { composeAuthedNavigation, user: currentUser } = useAuthService()

  const { styles, colorScheme } = useTheme()

  const replyItems = useMemo(() => {
    if (!listSwr.data && !listSwr.error) {
      // initial loading
      return new Array(10)
    }
    const items = (listSwr.data || []).reduce((combined, page) => {
      if (page.data) {
        return [...combined, ...page.data]
      }
      return combined
    }, [])
    return items
  }, [listSwr])

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
          topicSwr.data &&
            topicSwr.mutate((prev) => ({
              ...prev,
              ...data,
            }))
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
          topicSwr.data &&
            topicSwr.mutate((prev) => ({
              ...prev,
              ...data,
            }))
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
        topicSwr.mutate(
          (prev) => ({
            ...prev,
            collected: false,
          }),
          false,
        )
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
            topicSwr.mutate(
              (prev) => ({
                ...prev,
                collected: true,
              }),
              false,
            )
            alert.show({ type: 'error', message: err.message })
          })
      } else {
        topicSwr.mutate(
          (prev) => ({
            ...prev,
            collected: true,
          }),
          false,
        )
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
            topicSwr.mutate(
              (prev) => ({
                ...prev,
                collected: false,
              }),
              false,
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
      topicSwr.mutate(
        (prev) => ({
          ...prev,
          thanked: true,
        }),
        false,
      )

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
          topicSwr.mutate(
            (prev) => ({
              ...prev,
              thanked: false,
            }),
            false,
          )
          alert.show({ type: 'error', message: err.message })
        })
    }, [id, topic?.thanked]),
  )

  const handleShare = useCallback(async () => {
    try {
      const result = await Share.share({
        message: topic.title || `https://v2ex.com/t/${topic.id}`,
        url: `https://v2ex.com/t/${topic.id}`,
      })
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
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
      return `$app$/topic-${context.type}:${id}/${context.target?.id || 'root'}`
    },
    [id, replyContext],
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
          listSwr.mutate(
            (currentData) => {
              const currentPageIndex = p - 1
              const currentPageData = currentData[currentPageIndex]
              const targetIndex = currentData[p - 1].data.findIndex(
                (item: TopicReply) => item.id === reply.id,
              )
              const currentReply = currentData[p - 1].data[targetIndex]

              const newCurrentPageData = {
                ...currentPageData,
                data: [
                  ...currentPageData.data.slice(0, targetIndex),
                  { ...currentReply, ...data },
                  ...currentPageData.data.slice(targetIndex + 1),
                ],
              }

              return [
                ...currentData.slice(0, currentPageIndex),
                newCurrentPageData,
                ...currentData.slice(currentPageIndex + 1),
              ]
            },
            {
              revalidate: false,
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
              const p = getPageNum(reply.num)
              listSwr.mutate(
                (currentData) => {
                  const pageData = currentData[p - 1]
                  if (pageData?.data.length === 100 || !pageData) {
                    listSwr.setSize(p)
                  } else {
                    pageData.data.push(reply)
                  }
                  return currentData
                },
                // , false
              )
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
              topicSwr.mutate(topic, false)
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
    topicSwr.mutate()
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
    return () => {
      InteractionManager.runAfterInteractions(() => {
        if (currentIndexRef.current > 10) {
          setLastIndex(currentIndexRef.current, true)
        } else {
          setLastIndex(undefined, true)
        }
      })
    }
  }, [])

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
      keyExtractor(item, index) {
        return item?.id || `index-${index}`
      },
    }
  }, [id, replyItems])

  const handleReachEnd = useCallback(() => {
    if (shouldLoadMore(listSwr)) {
      listSwr.setSize(listSwr.size + 1)
    }
  }, [listSwr, topicSwr])

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
              isLoading(topicSwr) || (!topicSwr.data && isLoading(listSwr))
            }
            data={topicSwr.data}
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
          <CommonListFooter data={listSwr} emptyMessage="目前尚无回复" />
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
            onRefresh={() => {
              if (listSwr.isValidating) {
                return
              }
              listSwr.mutate()
            }}
            refreshing={isRefreshing(listSwr)}
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
      {topicSwr.data?.canMove && (
        <MyBottomSheetModal
          ref={changeNodeModalRef}
          index={0}
          snapPoints={moveModalSnapPoints}>
          <TopicMovePanel
            topicId={topicSwr.data.id}
            node={topicSwr.data.node}
            onExit={() => {
              changeNodeModalRef.current?.dismiss()
            }}
            onUpdated={(topic) => {
              topicSwr.mutate(topic, { revalidate: false })
            }}
          />
        </MyBottomSheetModal>
      )}
    </>
  )
}

export default memo(TopicScreen)
