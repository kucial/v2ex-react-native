import {
  Text,
  View,
  Image,
  useWindowDimensions,
  Pressable,
  FlatList,
  SafeAreaView,
  RefreshControl,
  Share,
  Linking
} from 'react-native'
import React, {
  useLayoutEffect,
  useMemo,
  useCallback,
  useState,
  memo,
  useRef,
  useEffect
} from 'react'
import { useSWRConfig } from 'swr'
import useSWRInfinite from 'swr/infinite'
import {
  HeartIcon,
  ShareIcon,
  StarIcon,
  EllipsisHorizontalIcon
} from 'react-native-heroicons/outline'
import {
  HeartIcon as FilledHeartIcon,
  StarIcon as FilledStarIcon
} from 'react-native-heroicons/solid'

// import { TagIcon } from 'react-native-heroicons/outline'
import { useActionSheet } from '@expo/react-native-action-sheet'

import HtmlRender from '@/components/HtmlRender'
import ErrorNotice from '@/components/ErrorNotice'
import { BlockText, Box } from '@/components/Skeleton/Elements'
import TopicSkeleton from '@/components/Skeleton/TopicSkeleton'
import CommonListFooter from '@/components/CommonListFooter'
import SlideUp from '@/components/SlideUp'

import { hasReachEnd, isLoading, useSWR, isRefreshing } from '@/utils/swr'
import fetcher from '@/utils/fetcher'

import { useAlertService } from '@/containers/AlertService'
import { useActivityIndicator } from '@/containers/ActivityIndicator'
import { useAuthService } from '@/containers/AuthService'
import { useViewedTopics } from '@/containers/ViewedTopicsService'

import TopicReplyForm from './TopicReplyForm'
import ReplyRow from './ReplyRow'
import Converation from './Conversation'
import classNames from 'classnames'
import { useColorScheme, useTailwind } from 'tailwindcss-react-native'
import colors from 'tailwindcss/colors'

const REPLY_PAGE_SIZE = 100
const getPageNum = (num) => Math.ceil(num / REPLY_PAGE_SIZE)
const getTopicLink = (id) => `https://v2ex.com/t/${id}`

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

const getRelatedReplies = (pivot, replyList) => {
  const list = [pivot]
  const beforePivotReplies = replyList.slice(0, pivot.num - 1)
  const afterPivotReplies = replyList.slice(pivot.num)

  console.log(
    pivot.num,
    replyList.length,
    beforePivotReplies.length,
    afterPivotReplies.length
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
          beforeMetionInWay.add(username)
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
      afterMentionInWay.add(r.member)
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

function TopicScreen({ navigation, route }) {
  const {
    params: { brief, id }
  } = route
  const { colorScheme } = useColorScheme()

  const { showActionSheetWithOptions } = useActionSheet()
  const alert = useAlertService()
  const { touchViewed } = useViewedTopics()

  const [conversationContext, setConversationContext] = useState(null)

  const listRef = useRef()
  const { width } = useWindowDimensions()
  const { composeAuthedNavigation } = useAuthService()
  const aIndicator = useActivityIndicator()

  const tw = useTailwind()
  const { color: iconColor } = tw('color-neutral-800 dark:color-neutral-400')
  const { color: collectActiveColor } = tw(
    'color-yellow-400 dark:color-yellow-200'
  )
  const { color: likedActiveColor } = tw('color-red-700 dark:color-rose-400')

  const topicSwr = useSWR(`/page/t/${id}/topic.json`)
  const listSwr = useSWRInfinite(
    useCallback(
      (index) => {
        return `/page/t/${id}/replies.json?p=${index + 1}`
      },
      [id]
    )
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

  const topic = topicSwr.data || brief
  const isFallback = topic === brief

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
                  topic?.blocked ? '取消忽略主题' : '忽略主题'
                ],
                cancelButtonIndex: 0,
                destructiveButtonIndex: 3
              },
              (buttonIndex) => {
                if (buttonIndex === 1) {
                  navigation.push('browser', {
                    url: getTopicLink(id)
                  })
                } else if (buttonIndex === 2) {
                  Linking.openURL(getTopicLink(id))
                } else if (buttonIndex === 3) {
                  const endpoint = topic?.blocked
                    ? `/page/t/${id}/unblock.json`
                    : `/page/t/${id}/block.json`
                  aIndicator.show()
                  fetcher(endpoint)
                    .then((result) => {
                      topicSwr.data &&
                        topicSwr.mutate((prev) => ({
                          ...prev,
                          ...result
                        }))
                      alert.alertWithType(
                        'success',
                        '操作成功',
                        result.blocked ? '已忽略主题' : '已撤销主题忽略'
                      )
                    })
                    .catch((err) => {
                      alert.alertWithType('error', '错误', err.message)
                    })
                    .finally(() => {
                      aIndicator.hide()
                    })
                }
              }
            )
          }}>
          <EllipsisHorizontalIcon size={24} color={iconColor} />
        </Pressable>
      )
    })
  }, [id, topic?.blocked])

  useLayoutEffect(() => {
    if (topic?.title) {
      navigation.setOptions({
        title: topic.title
      })
    }
  }, [topic?.title])

  useEffect(() => {
    if (topicSwr.data) {
      touchViewed(topicSwr.data)
    }
  }, [topicSwr.data])

  const htmlRenderProps = useMemo(() => {
    if (!topic) {
      return {}
    }
    return {
      baseStyle: {
        fontSize: 16
      },
      source: {
        html: topic.content_rendered,
        baseUrl: 'https://v2ex.com'
      }
    }
  }, [topic?.content_rendered])

  const { cache } = useSWRConfig()
  const [replyContext, setReplyContext] = useState(null)
  const initReply = useCallback(
    (reply) => {
      setReplyContext({ target: reply })
    },
    [id]
  )
  const getReplyFormCacheKey = useCallback(() => {
    return `topic-reply:${id}/${replyContext.target?.id || 'root'}`
  }, [id, replyContext])

  const handleThankToReply = useCallback(
    (reply) => {
      const p = getPageNum(reply.num)

      fetcher(`/page/t/${id}/thank-reply.json?p=${p}`, {
        data: {
          replyId: reply.id
        }
      })
        .then(({ data }) => {
          listSwr.mutate((currentData) => {
            const targetIndex = currentData[p - 1].data.findIndex(
              (item) => item.id === reply.id
            )
            currentData[p - 1].data[targetIndex] = data
            return currentData
          }, false)
        })
        .catch((err) => {
          alert.alertWithType?.('error', '错误', err.message)
        })
    },
    [id]
  )

  const handleSubmitReply = useCallback(
    (values) => {
      setReplyContext(null)
      aIndicator.show()
      return fetcher(`/page/t/${id}/reply.json`, {
        data: values
      })
        .then(({ data: reply }) => {
          const p = getPageNum(reply.num)
          listSwr.mutate((currentData) => {
            const pageData = currentData[p - 1]
            if (pageData?.data.length === 100 || !pageData) {
              listSwr.setSize(p)
            } else {
              pageData.data.push(reply)
            }
            return currentData
          }, false)
          const cacheKey = getReplyFormCacheKey(replyContext)
          cache.delete(cacheKey)
          alert.alertWithType('success', '', '回复成功')
        })
        .catch((err) => {
          alert.alertWithType('error', '', err.message)
        })
        .finally(() => {
          aIndicator.hide()
        })
    },
    [id, replyContext]
  )

  const showConversation = useCallback((reply) => {
    setConversationContext(reply)
  }, [])

  const { renderReply, keyExtractor } = useMemo(() => {
    return {
      renderReply({ item }) {
        return (
          <ReplyRow
            className="bg-white dark:bg-neutral-900"
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
      }
    }
  }, [id, replyItems])

  const conversation = useMemo(() => {
    if (!conversationContext) {
      return null
    }
    return getRelatedReplies(conversationContext, replyItems)
  }, [conversationContext, replyItems])

  if (!topic) {
    return <TopicSkeleton />
  }
  const { member, node } = topic
  // return null

  const baseContent = (
    <>
      <View className="bg-white py-3 px-4 mb-2 shadow-sm dark:bg-neutral-900">
        <View className="flex flex-row mb-2">
          <View className="flex flex-row flex-1">
            <Pressable
              hitSlop={4}
              onPress={() => {
                navigation.push('member', {
                  username: member.username
                })
              }}>
              {member.avatar_large ? (
                <Image
                  source={{ uri: member.avatar_large }}
                  className="w-[32px] h-[32px] rounded"
                />
              ) : (
                <Box className="w-[32px] h-[32px] rounded" />
              )}
            </Pressable>
            <View className="pl-2 flex flex-row items-center">
              <View className="py-[2px]">
                <Pressable
                  hitSlop={4}
                  onPress={() => {
                    navigation.push('member', {
                      username: member.username
                    })
                  }}>
                  <Text className="font-medium dark:text-neutral-300">
                    {member.username}
                  </Text>
                </Pressable>
              </View>
              <View className="ml-2">
                <Text className="text-neutral-400 text-xs dark:text-neutral-300">
                  {topic.created_time}
                </Text>
              </View>
            </View>
          </View>
          <View>
            {node && (
              <Pressable
                className="py-1 px-[6px] rounded bg-neutral-100 active:opacity-50 dark:bg-neutral-750"
                hitSlop={6}
                onPress={() => {
                  navigation.push('node', {
                    name: node.name,
                    brief: node
                  })
                }}>
                <Text className="text-neutral-500 dark:text-neutral-300">
                  {node.title}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
        <View className="pb-2 border-b border-b-neutral-300 border-solid mb-2 dark:border-b-neutral-600">
          <Text
            selectable
            className="text-lg font-semibold dark:text-neutral-300">
            {topic.title}
          </Text>
        </View>
        {!!topic.content_rendered && (
          <HtmlRender contentWidth={width - 32} {...htmlRenderProps} />
        )}
        {!!topic.subtles?.length && (
          <View className="mt-2">
            {topic.subtles.map((subtle, index) => (
              <View
                className="-mx-2 pl-4 pr-2 py-2 border-t border-neutral-300 dark:border-neutral-700 bg-[#ffff0008] dark:bg-[#ffff8808]"
                key={index}>
                <View className="mb-1">
                  <Text className="text-xs text-neutral-500">
                    {subtle.meta}
                  </Text>
                </View>
                <HtmlRender
                  contentWidth={width - 32}
                  {...htmlRenderProps}
                  source={{
                    html: subtle.content_rendered
                  }}
                />
              </View>
            ))}
          </View>
        )}
        {topicSwr.error && !isLoading(topicSwr) && (
          <ErrorNotice
            error={topicSwr.error}
            extra={
              <View className="mt-2 flex flex-row justify-center">
                <Pressable
                  className={classNames(
                    'px-4 h-[44px] w-[120px] rounded-full bg-neutral-900 items-center justify-center active:opacity-60',
                    'dark:bg-amber-50'
                  )}
                  onPress={() => {
                    topicSwr.mutate()
                  }}>
                  <Text className="text-white dark:text-neutral-800">重试</Text>
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
      </View>
      {!!topic.replies && (
        <View
          className={classNames(
            'px-3 py-2 border-b',
            'bg-white border-neutral-300',
            'dark:bg-neutral-900 dark:border-neutral-600'
          )}>
          <Text className="text-neutral-600 dark:text-neutral-300">
            {topic.replies} 条回复
          </Text>
        </View>
      )}

      {/* <View className="bg-white p-4 mb-2">
        <TagIcon size={18} color={'#444'} />
      </View> */}
    </>
  )

  return (
    <View className="flex-1">
      <FlatList
        ref={listRef}
        className="flex-1"
        data={replyItems}
        renderItem={renderReply}
        keyExtractor={keyExtractor}
        ListHeaderComponent={() => baseContent}
        ListFooterComponent={
          <CommonListFooter data={listSwr} emptyMessage="目前尚无回复" />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!listSwr.isValidating && !hasReachEnd(listSwr)) {
            listSwr.setSize(listSwr.size + 1)
          }
        }}
        refreshControl={
          <RefreshControl
            tintColor={
              colorScheme === 'dark' ? colors.neutral[300] : colors.neutral[900]
            }
            onRefresh={() => {
              if (listSwr.isValidating) {
                return
              }
              listSwr.mutate()
              if (!topicSwr.data && topicSwr.error) {
                topicSwr.mutate()
              }
            }}
            refreshing={isRefreshing(listSwr)}
          />
        }
      />
      <SafeAreaView className="u-absolute bottom-0 left-0 w-full bg-white border-t border-t-neutral-200 dark:bg-neutral-800 dark:border-neutral-600">
        <View className="h-[48px] flex flex-row items-center pl-3 pr-1">
          <View className="flex-1 mr-2">
            <Pressable
              hitSlop={5}
              className="h-[32px] w-full justify-center px-3 bg-neutral-100 rounded-full active:opacity-60 dark:bg-neutral-900"
              onPress={() => {
                initReply()
              }}>
              <Text className="text-neutral-800 text-sm dark:text-neutral-300">
                发表评论
              </Text>
            </Pressable>
          </View>
          <View className="flex flex-row px-1">
            <Pressable
              className="w-[46px] h-[48px] items-center justify-center active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
              onPress={composeAuthedNavigation(() => {
                if (topic.collected) {
                  topicSwr.mutate(
                    (prev) => ({
                      ...prev,
                      collected: false
                    }),
                    false
                  )
                  fetcher(`/page/t/${id}/uncollect.json`)
                    .then(() => {
                      alert.alertWithType('success', '操作成功', '已取消收藏')
                    })
                    .catch((err) => {
                      topicSwr.mutate(
                        (prev) => ({
                          ...prev,
                          collected: true
                        }),
                        false
                      )
                      alert.alertWithType('error', '错误', err.message)
                    })
                } else {
                  topicSwr.mutate(
                    (prev) => ({
                      ...prev,
                      collected: true
                    }),
                    false
                  )
                  fetcher(`/page/t/${id}/collect.json`)
                    .then(() => {
                      alert.alertWithType('success', '操作成功', '已加入收藏')
                    })
                    .catch((err) => {
                      topicSwr.mutate(
                        (prev) => ({
                          ...prev,
                          collected: false
                        }),
                        false
                      )
                      alert.alertWithType('error', '错误', err.message)
                    })
                }
              })}>
              <View className="my-1">
                {topic.collected ? (
                  <FilledStarIcon size={24} color={collectActiveColor} />
                ) : (
                  <StarIcon size={24} color={iconColor} />
                )}
              </View>
              <Text className="text-neutral-600 dark:text-neutral-300 text-[10px]">
                收藏
              </Text>
            </Pressable>
            <Pressable
              className="w-[46px] h-[48px] items-center justify-center active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
              onPress={composeAuthedNavigation(() => {
                if (topic.thanked) {
                  // TODO: SHOW MESSAGE
                  return
                }
                fetcher(`/page/t/${id}/thank.json`)
                  .then((res) => {
                    console.log(res)
                    topicSwr.mutate(
                      (prev) => ({
                        ...prev,
                        thanked: true
                      }),
                      false
                    )
                  })
                  .catch((err) => {
                    alert.alertWithType('error', '错误', err.message)
                  })
              })}>
              <View className="my-1">
                {topic.thanked ? (
                  <FilledHeartIcon size={24} color={likedActiveColor} />
                ) : (
                  <HeartIcon size={24} color={iconColor} />
                )}
              </View>
              <Text className="text-neutral-600 dark:text-neutral-300 text-[9px]">
                感谢
              </Text>
            </Pressable>
            <Pressable
              className="w-[46px] h-[48px] items-center justify-center active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
              disabled={!topicSwr.data}
              onPress={async () => {
                try {
                  const result = await Share.share({
                    message: topic.title,
                    url: `https://v2ex.com/t/${topic.id}`
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
              <Text className="text-neutral-600 dark:text-neutral-300 text-[9px]">
                分享
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
      {replyContext && (
        <SlideUp
          visible={!!replyContext}
          onRequestClose={() => {
            setReplyContext(null)
          }}>
          <TopicReplyForm
            cacheKey={getReplyFormCacheKey(replyContext)}
            context={replyContext}
            onSubmit={handleSubmitReply}
          />
        </SlideUp>
      )}
      {conversationContext && !replyContext && (
        <SlideUp
          visible={!!conversationContext}
          onRequestClose={() => {
            setConversationContext(null)
          }}>
          <Converation
            data={conversation}
            pivot={conversationContext}
            onReply={initReply}
            onThank={handleThankToReply}
          />
        </SlideUp>
      )}
    </View>
  )
}

export default memo(TopicScreen)
