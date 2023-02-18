import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Linking,
  Pressable,
  SafeAreaView,
  Share,
  Text,
  View,
} from 'react-native'
import { Keyboard } from 'react-native'
import {
  EllipsisHorizontalIcon,
  HeartIcon,
  ShareIcon,
  StarIcon,
} from 'react-native-heroicons/outline'
import {
  HeartIcon as FilledHeartIcon,
  StarIcon as FilledStarIcon,
} from 'react-native-heroicons/solid'
// import { TagIcon } from 'react-native-heroicons/outline'
import { useActionSheet } from '@expo/react-native-action-sheet'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { FlashList } from '@shopify/flash-list'
import classNames from 'classnames'
import deepmerge from 'deepmerge'
import { debounce } from 'lodash'
import useSWR from 'swr'
import useSWRInfinite from 'swr/infinite'

import CommonListFooter from '@/components/CommonListFooter'
import ErrorNotice from '@/components/ErrorNotice'
import { BlockText } from '@/components/Skeleton/Elements'
import TopicSkeleton from '@/components/Skeleton/TopicSkeleton'
import { useActivityIndicator } from '@/containers/ActivityIndicator'
import { useAlertService } from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'
import { useViewedTopics } from '@/containers/ViewedTopicsService'
import { useScrollDirection } from '@/utils/scroll'
import { setJSON } from '@/utils/storage'
import { isLoading, isRefreshing, shouldLoadMore } from '@/utils/swr'
import * as v2exClient from '@/utils/v2ex-client'
import { TopicDetail, TopicReply } from '@/utils/v2ex-client/types'

import Conversation from './Conversation'
import ReplyRow from './ReplyRow'
import ScrollControl, { ScrollControlApi } from './ScrollControl'
import TopicInfo from './TopicInfo'
import TopicReplyForm from './TopicReplyForm'

const REPLY_PAGE_SIZE = 100
const getPageNum = (num: number) => Math.ceil(num / REPLY_PAGE_SIZE)
const getTopicLink = (id: string | number) => `https://v2ex.com/t/${id}`

const replyModalSnapPoints = ['25%']
const conversationSnapPoints = ['60%', '90%']

const renderBackdrop = (props) => {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
      onPress={() => {
        Keyboard.dismiss()
      }}
    />
  )
}

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

  console.log(
    pivot.num,
    replyList.length,
    beforePivotReplies.length,
    afterPivotReplies.length,
  )

  /**
   * Pivot 之前的回复
   * 沿路查查中 被 mention 相关的回复，如果被 mention 的回复为 `root` 回复，则继续查找 回复作者的其他 `root` 回复
   */
  //
  const beforeMetionInWay = new Set(pivot.members_mentioned)
  const rootReplyUsers = new Set()
  if (!pivot.members_mentioned.length) {
    rootReplyUsers.add(pivot.member.username)
  }
  beforePivotReplies.reverse().forEach((r) => {
    if (rootReplyUsers.has(r.member.username) && !r.members_mentioned.length) {
      list.unshift(r)
      return
    }

    if (beforeMetionInWay.has(r.member.username)) {
      beforeMetionInWay.delete(r.member.username)
      if (r.members_mentioned.length) {
        r.members_mentioned.forEach((username) =>
          beforeMetionInWay.add(username),
        )
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
  afterPivotReplies.forEach((r) => {
    if (
      r.members_mentioned.includes(pivot.member.username) &&
      !pivot.members_mentioned.length
    ) {
      afterMentionInWay.add(r.member.username)
      list.push(r)
      return
    }
    if (
      (r.member.username === pivot.member.username &&
        isIntersected(r.members_mentioned, pivot.members_mentioned)) ||
      (afterMentionInWay.has(r.member.username) &&
        r.members_mentioned.includes(pivot.member.username))
    ) {
      list.push(r)
    }
  })

  return list
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

  const { showActionSheetWithOptions } = useActionSheet()
  const alert = useAlertService()
  const { touchViewed } = useViewedTopics()

  const [conversationContext, setConversationContext] = useState(null)
  const { data: settings } = useAppSettings()

  const listRef = useRef<FlashList<TopicReply>>()
  const replyModalRef = useRef<BottomSheetModal>()
  const conversationModalRef = useRef<BottomSheetModal>()
  const { composeAuthedNavigation } = useAuthService()
  const aIndicator = useActivityIndicator()
  const scrollControlRef = useRef<ScrollControlApi>(null)

  const { theme, styles } = useTheme()

  const iconColor = theme.colors.text_meta
  const collectActiveColor = theme.colors.icon_collected_bg
  const likedActiveColor = theme.colors.icon_liked_bg

  const topicSwr = useSWR(
    [`/page/t/:id/topic.json`, id],
    async ([_, id]) => {
      const { data } = await v2exClient.getTopicDetail({ id, api: true })
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
  const isFallback = topic === brief

  useEffect(() => {
    if (!topicSwr.data) {
      topicSwr.mutate()
    }
  }, [])

  const listSwr = useSWRInfinite(
    useCallback(
      (index): [string, number, number] => {
        return [`/page/t/:id/replies.json`, id, index + 1]
      },
      [id],
    ),
    ([_, id, page]) => v2exClient.getTopicReplies({ id, p: page }),
    {
      initialSize: Math.max(1, Math.ceil((topic?.replies || 0) / 100)),
      revalidateOnMount: true,
      revalidateOnFocus: false,
      onSuccess: (data) => {
        const topic = data[data.length - 1]?.meta?.topic
        if (topic) {
          topicSwr.mutate(
            (prev) =>
              deepmerge(prev, topic, {
                arrayMerge: (a, b) => b,
              }),
            false,
          )
          touchViewed(topic)
        }
      },
      onErrorRetry(err) {
        if (err.code === 'RESOURCE_ERROR') {
          return
        }
      },
    },
  )

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

  const handleBlockMember = composeAuthedNavigation((username: string) => {
    aIndicator.show('MEMBER_BLOCK')
    v2exClient
      .blockMember({
        username,
      })
      .then(() => {
        alert.alertWithType('success', '操作成功', '已屏蔽用户')
      })
      .catch((err) => {
        alert.alertWithType('error', '错误', err.message)
      })
      .finally(() => {
        aIndicator.hide('MEMBER_BLOCK')
      })
  })

  const handleToggleBlock = composeAuthedNavigation(
    useCallback(() => {
      aIndicator.show('TOPIC_BLOCK')
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
          alert.alertWithType(
            'success',
            '操作成功',
            data.blocked ? '已忽略主题' : '已撤销主题忽略',
          )
        })
        .catch((err) => {
          alert.alertWithType('error', '错误', err.message)
        })
        .finally(() => {
          aIndicator.hide('TOPIC_BLOCK')
        })
    }, [id, topic?.blocked]),
  )

  const handleReportTopic = composeAuthedNavigation(
    useCallback(() => {
      aIndicator.show('TOPIC_REPORT')
      v2exClient
        .reportTopic({ id })
        .then(({ data }) => {
          topicSwr.data &&
            topicSwr.mutate((prev) => ({
              ...prev,
              ...data,
            }))
          if (data.reported) {
            alert.alertWithType('success', '成功', '已举报主题')
          } else {
            alert.alertWithType('error', '错误', '未成功举报举报主题')
          }
        })
        .catch((err) => {
          alert.alertWithType('error', '错误', err.message)
        })
        .finally(() => {
          aIndicator.hide('TOPIC_REPORT')
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
            alert.alertWithType('success', '操作成功', '已取消收藏')
          })
          .catch((err) => {
            topicSwr.mutate(
              (prev) => ({
                ...prev,
                collected: true,
              }),
              false,
            )
            alert.alertWithType('error', '错误', err.message)
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
            alert.alertWithType('success', '操作成功', '已加入收藏')
          })
          .catch((err) => {
            topicSwr.mutate(
              (prev) => ({
                ...prev,
                collected: false,
              }),
              false,
            )
            alert.alertWithType('error', '错误', err.message)
          })
      }
    }, [id, topic?.collected]),
  )

  const handleThankTopic = composeAuthedNavigation(
    useCallback(() => {
      if (topic.thanked) {
        alert.alertWithType('info', '提示', '已感谢过主题')
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
          alert.alertWithType('success', '操作成功', '已感谢主题')
        })
        .catch((err) => {
          topicSwr.mutate(
            (prev) => ({
              ...prev,
              thanked: false,
            }),
            false,
          )
          alert.alertWithType('error', '错误', err.message)
        })
    }, [id, topic?.thanked]),
  )

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (props) => (
        <Pressable
          className="h-[44px] w-[44px] items-center justify-center -mr-4 active:opacity-60"
          onPress={() => {
            // actionsheet
            showActionSheetWithOptions(
              {
                title: `#${id}`,
                options: [
                  '取消',
                  '在内部 WebView 打开',
                  '在外部浏览器中打开',
                  '屏蔽用户',
                  topic?.blocked ? '取消忽略主题' : '忽略主题',
                  '举报',
                ],
                cancelButtonIndex: 0,
                destructiveButtonIndex: 5,
              },
              (buttonIndex) => {
                if (buttonIndex === 1) {
                  navigation.push('browser', {
                    url: getTopicLink(id),
                  })
                } else if (buttonIndex === 2) {
                  Linking.openURL(getTopicLink(id))
                } else if (buttonIndex === 3) {
                  const username = topic.member?.username
                  if (!username) {
                    return
                  }
                  handleBlockMember(username)
                } else if (buttonIndex === 4) {
                  handleToggleBlock()
                } else if (buttonIndex === 5) {
                  handleReportTopic()
                }
              },
            )
          }}>
          <EllipsisHorizontalIcon size={24} color={theme.colors.primary} />
        </Pressable>
      ),
    })
  }, [id, topic?.blocked])

  useLayoutEffect(() => {
    if (topic?.title) {
      navigation.setOptions({
        title: topic.title,
      })
    }
  }, [topic?.title])

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
            alert.alertWithType?.('success', '操作成功', message)
          } else {
            alert.alertWithType('error', '操作失败', message)
          }
          listSwr.mutate((currentData) => {
            const targetIndex = currentData[p - 1].data.findIndex(
              (item: TopicReply) => item.id === reply.id,
            )
            const currentReply = currentData[p - 1].data[targetIndex]
            currentData[p - 1].data[targetIndex] = {
              ...currentReply,
              ...data,
            }
            return currentData
          }, false)
        })
        .catch((err) => {
          alert.alertWithType?.('error', '错误', err.message)
        })
    },
    [id],
  )

  const handleSubmitReply = useCallback(
    async (values: { content: string }) => {
      replyModalRef.current?.dismiss()
      setReplyContext(null)
      const KEY = `topic-reply:${id}`
      aIndicator.show(KEY)
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
              alert.alertWithType('success', '成功', '回复成功')
            } catch (err) {
              alert.alertWithType('error', '错误', err.message)
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
              alert.alertWithType('success', '成功', '附言成功')
            } catch (err) {
              alert.alertWithType('error', '错误', err.message)
            }
        }
      } finally {
        aIndicator.hide(KEY)
      }
    },
    [id, replyContext],
  )

  const showConversation = useCallback((reply) => {
    setConversationContext(reply)
    conversationModalRef.current?.present()
  }, [])

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      conversationModalRef.current?.dismiss()
    })
    return unsubscribe
  }, [navigation])

  const { renderReply, keyExtractor } = useMemo(() => {
    return {
      renderReply({ item }) {
        return (
          <ReplyRow
            style={styles.layer1}
            showAvatar={settings.feedShowAvatar}
            navigation={navigation}
            data={item}
            onReply={initReply}
            onThank={handleThankToReply}
            hasConversation={hasRelatedMessages(item, replyItems)}
            onShowConversation={showConversation}
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

  const handleNavTo = useCallback((target: number) => {
    if (target === 0) {
      listRef.current.scrollToOffset({
        offset: 0,
        animated: true,
      })
      return
    }
    listRef.current.scrollToIndex({
      index: target - 1,
      animated: true,
    })
  }, [])

  const conversation = useMemo(() => {
    if (!conversationContext) {
      return null
    }
    return getRelatedReplies(conversationContext, replyItems)
  }, [conversationContext, replyItems])

  const directionCallback = useCallback((direction) => {
    if (direction === 'down') {
      scrollControlRef.current?.setAction('to_bottom')
    } else {
      scrollControlRef.current?.setAction('to_top')
    }
  }, [])
  const { onScroll, resetDirection } = useScrollDirection({
    callback: directionCallback,
  })

  const resetScrollControlAction = useCallback(
    debounce(
      () => {
        resetDirection()
        scrollControlRef.current?.setAction('')
      },
      500,
      { trailing: true },
    ),
    [],
  )
  const handleScroll = useCallback((e) => {
    onScroll(e)
    resetScrollControlAction()
  }, [])
  useEffect(() => {
    return () => {
      resetScrollControlAction.cancel()
    }
  }, [resetScrollControlAction])

  if (!topic) {
    return <TopicSkeleton />
  }

  const baseContent = (
    <>
      <View className="py-3 px-4 mb-2 shadow-sm" style={styles.layer1}>
        <TopicInfo data={topic} navigation={navigation} />
        {!topicSwr.data && topicSwr.error && !isLoading(topicSwr) && (
          <ErrorNotice
            error={topicSwr.error}
            extra={
              <View className="mt-2 flex flex-row justify-center">
                <Pressable
                  className={classNames(
                    'px-4 h-[44px] w-[120px] rounded-full items-center justify-center',
                    'active:opacity-60',
                  )}
                  style={[styles.btn_primary__bg]}
                  onPress={() => {
                    topicSwr.mutate()
                  }}>
                  <Text style={styles.btn_primary__text}>重试</Text>
                </Pressable>
              </View>
            }
          />
        )}
        {isFallback && isLoading(topicSwr) && (
          <View className="mt-1">
            <BlockText lines={[5, 10]} />
          </View>
        )}
        {topic.canAppend && (
          <View className="flex flex-row justify-end relative bottom-[-6px]">
            <Pressable
              className="px-3 h-[36px] rounded items-center justify-center active:opacity-60"
              style={styles.layer2}
              onPress={() => {
                setReplyContext({
                  type: 'append',
                })
                replyModalRef.current?.present()
              }}>
              <Text style={styles.text}>附言</Text>
            </Pressable>
          </View>
        )}
      </View>

      {(!!topic.replies || !!topic.clicks) && (
        <View
          className={classNames(
            'px-3 py-2 flex flex-row justify-between items-center',
          )}
          style={[styles.layer1, styles.border_b]}>
          <View className="flex flex-row">
            <Text className="text-xs pr-2" style={styles.text_desc}>
              {topic.replies} 条回复
            </Text>
            {topic.clicks && (
              <Text className="text-xs" style={styles.text_meta}>
                {topic.clicks} 次点击
              </Text>
            )}
          </View>
        </View>
      )}

      {/* <View className="bg-white p-4 mb-2">
        <TagIcon size={18} color={'#444'} />
      </View> */}
    </>
  )

  return (
    <>
      {/* {baseContent} */}
      <FlashList
        ref={listRef}
        className="flex-1"
        data={replyItems}
        renderItem={renderReply}
        keyExtractor={keyExtractor}
        ListHeaderComponent={() => baseContent}
        ListFooterComponent={
          <CommonListFooter data={listSwr} emptyMessage="目前尚无回复" />
        }
        estimatedItemSize={140}
        onEndReachedThreshold={0.4}
        onEndReached={handleReachEnd}
        onRefresh={() => {
          if (listSwr.isValidating) {
            return
          }
          listSwr.mutate()
        }}
        refreshing={isRefreshing(listSwr)}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      <SafeAreaView
        className="u-absolute bottom-0 left-0 w-full"
        style={[styles.overlay, styles.border_t, styles.border_light]}>
        <View className="h-[48px] flex flex-row items-center pl-3 pr-1">
          <View className="flex-1 mr-2">
            <Pressable
              hitSlop={5}
              className="h-[32px] w-full justify-center px-3 rounded-full active:opacity-60"
              style={styles.overlay_input__bg}
              onPress={() => {
                initReply()
              }}>
              <Text className="text-sm" style={styles.text_placeholder}>
                发表评论
              </Text>
            </Pressable>
          </View>
          <ScrollControl
            ref={scrollControlRef}
            max={topic.replies}
            onNavTo={handleNavTo}
          />
          <View className="flex flex-row px-1">
            <Pressable
              className="w-[46px] h-[48px] rounded-md items-center justify-center active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
              onPress={handleToggleCollect}>
              <View className="my-1">
                {topic.collected ? (
                  <FilledStarIcon size={24} color={collectActiveColor} />
                ) : (
                  <StarIcon size={24} color={iconColor} />
                )}
              </View>
              <Text className="text-[10px]" style={styles.text_meta}>
                收藏
              </Text>
            </Pressable>
            <Pressable
              className="w-[46px] h-[48px] rounded-md items-center justify-center active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
              onPress={handleThankTopic}>
              <View className="my-1">
                {topic.thanked ? (
                  <FilledHeartIcon size={24} color={likedActiveColor} />
                ) : (
                  <HeartIcon size={24} color={iconColor} />
                )}
              </View>
              <Text className="text-[10px]" style={styles.text_meta}>
                感谢
              </Text>
            </Pressable>
            <Pressable
              className="w-[46px] h-[48px] rounded-md items-center justify-center active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
              disabled={!topicSwr.data}
              onPress={async () => {
                try {
                  const result = await Share.share({
                    message: topic.title,
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
              }}>
              <View className="my-1">
                <ShareIcon size={24} color={iconColor} />
              </View>
              <Text className="text-[10px]" style={styles.text_meta}>
                分享
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
      <BottomSheetModal
        ref={conversationModalRef}
        index={0}
        snapPoints={conversationSnapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.overlay}
        handleIndicatorStyle={{
          backgroundColor: theme.colors.bts_handle_bg,
        }}>
        {conversationContext && (
          <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 44 }}>
            <Conversation
              showAvatar={settings.feedShowAvatar}
              navigation={navigation}
              data={conversation}
              pivot={conversationContext}
              onReply={initReply}
              onThank={handleThankToReply}
            />
          </BottomSheetScrollView>
        )}
      </BottomSheetModal>
      <BottomSheetModal
        ref={replyModalRef}
        index={0}
        snapPoints={replyModalSnapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.overlay}
        handleIndicatorStyle={{
          backgroundColor: theme.colors.bts_handle_bg,
        }}>
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
      </BottomSheetModal>
    </>
  )
}

export default memo(TopicScreen)
