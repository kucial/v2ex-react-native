import {
  Text,
  View,
  Image,
  useWindowDimensions,
  Pressable,
  FlatList,
  SafeAreaView,
  RefreshControl
} from 'react-native'
import React, { useLayoutEffect, useMemo, useCallback, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import useSWRInfinite from 'swr/infinite'
import { HeartIcon, ShareIcon, StarIcon } from 'react-native-heroicons/outline'
// import { TagIcon } from 'react-native-heroicons/outline'

import TimeAgo from '@/components/TimeAgo'
import RenderHtml from '@/components/RenderHtml'
import ErrorNotice from '@/components/ErrorNotice'
import { BlockText } from '@/components/Skeleton/Elements'
import TopicSkeleton from '@/components/Skeleton/TopicSkeleton'
import CommonListFooter from '@/components/CommonListFooter'
import SlideUp from '@/components/SlideUp'

import { hasReachEnd, useCustomSwr } from '@/utils/swr'
import fetcher from '@/utils/fetcher'
import { useAlertService } from '@/containers/AlertService'

import TopicReplyForm from './TopicReplyForm'
import ReplyRow from './ReplyRow'

const maxLen = (str = '', limit = 0) => {
  if (limit && str.length > limit) {
    return str.slice(0, limit) + ' ...'
  }
  return str
}

const REPLY_PAGE_SIZE = 100
const getPageNum = (num) => Math.ceil(num / REPLY_PAGE_SIZE)

export default function TopicScreen({ navigation, route }) {
  const {
    params: { brief, id }
  } = route

  const { width } = useWindowDimensions()
  const alert = useAlertService()

  const topicSwr = useCustomSwr(`/api/topics/show.json?id=${id}`)
  const listSwr = useSWRInfinite(
    useCallback(
      (index) => {
        return `/page/t/${id}/replies.json?p=${index + 1}`
      },
      [id]
    )
  )

  const listItems = useMemo(() => {
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

  const topic = topicSwr.data?.[0] || brief
  const isFallback = topic === brief

  useLayoutEffect(() => {
    if (topic?.title) {
      const title = maxLen(topic.title, 12)
      // const title = maxLen(`#${topic.id} ${topic.title}`, 16)
      navigation.setOptions({
        title
      })
    }
  }, [topic?.title])

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

  const { mutate } = useSWRConfig()
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
          alert.alertWithType?.('error', 'Error', err)
        })
    },
    [id]
  )

  const handleSubmitReply = useCallback(
    (values) => {
      return fetcher(`/page/t/${id}/reply.json`, {
        data: values
      }).then(({ data: reply }) => {
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
        setReplyContext(null)
        // cleanup cache after reply form unmount
        setTimeout(() => {
          mutate(cacheKey, undefined)
        }, 400)
      })
    },
    [id, replyContext]
  )

  const { renderReply, keyExtractor } = useMemo(() => {
    return {
      renderReply({ item }) {
        return (
          <ReplyRow
            data={item}
            onReply={initReply}
            onThank={handleThankToReply}
          />
        )
      },
      keyExtractor(item, index) {
        return item?.id || `index-${index}`
      }
    }
  }, [id])

  if (!topic) {
    return <TopicSkeleton />
  }
  const { member, node } = topic
  // return null

  const baseContent = (
    <>
      <View className="bg-white py-3 px-4 mb-2 shadow-sm">
        <View className="flex flex-row mb-2">
          <View className="flex flex-row flex-1">
            <Image
              source={{ uri: member.avatar_normal }}
              className="w-[32px] h-[32px] rounded"
            />
            <View className="pl-2 flex flex-row items-center">
              <View className="py-[2px]">
                <Pressable
                  hitSlop={4}
                  onPress={() => {
                    navigation.push('member', {
                      username: member.username
                    })
                  }}>
                  <Text className="font-medium">{member.username}</Text>
                </Pressable>
              </View>
              <View className="ml-2">
                {topic.created && (
                  <Text className="text-gray-400 text-xs">
                    <TimeAgo date={topic.created * 1000} />
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View>
            {node && (
              <Pressable
                className="py-1 px-[6px] rounded bg-gray-100 active:opacity-50"
                hitSlop={6}
                onPress={() => {
                  navigation.push('node', {
                    name: node.name,
                    brief: node
                  })
                }}>
                <Text className="text-gray-500">{node.title}</Text>
              </Pressable>
            )}
          </View>
        </View>
        <View className="pb-2 border-b border-b-gray-300 border-solid mb-2">
          <Text selectable className="text-lg font-semibold">
            {topic.title}
          </Text>
        </View>
        {!!topic.content_rendered && (
          <RenderHtml contentWidth={width - 32} {...htmlRenderProps} />
        )}
        {topicSwr.error && <ErrorNotice error={topicSwr.error} />}
        {isFallback && (
          <View className="mt-1">
            <BlockText lines={[5, 10]} />
          </View>
        )}
      </View>
      {/* <View className="bg-white p-4 mb-2">
        <TagIcon size={18} color={'#444'} />
      </View> */}
    </>
  )

  return (
    <View className="flex-1">
      <FlatList
        className="flex-1"
        data={listItems}
        renderItem={renderReply}
        keyExtractor={keyExtractor}
        ListHeaderComponent={() => baseContent}
        ListFooterComponent={<CommonListFooter data={listSwr} />}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (!listSwr.isValidating && !hasReachEnd(listSwr)) {
            listSwr.setSize(listSwr.size + 1)
          }
        }}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              if (listSwr.isValidating) {
                return
              }
              listSwr.mutate()
            }}
            refreshing={listSwr.data && listSwr.isValidating}
          />
        }
      />
      <SafeAreaView className="u-absolute bottom-0 left-0 w-full bg-white border-t border-t-gray-200">
        <View className="h-[44px] flex flex-row items-center pl-3 pr-1">
          <View className="flex-1 mr-2">
            <Pressable
              className="h-[32px] w-full justify-center px-3 bg-gray-100 rounded-full active:opacity-60"
              onPress={() => {
                initReply()
              }}>
              <Text className="text-gray-800 text-sm">发表评论</Text>
            </Pressable>
          </View>
          <View className="flex flex-row px-1">
            <Pressable className="w-[46px] h-[44px] items-center justify-center active:bg-gray-100 active:opacity-60">
              <StarIcon size={22} color="#333" />
              <Text className="text-gray-600 text-[9px] mt-[2px]">收藏</Text>
            </Pressable>
            <Pressable className="w-[46px] h-[44px] items-center justify-center active:bg-gray-100 active:opacity-60">
              <HeartIcon size={22} color="#333" />
              <Text className="text-gray-600 text-[9px] mt-[2px]">感谢</Text>
            </Pressable>
            <Pressable className="w-[46px] h-[44px] items-center justify-center active:bg-gray-100 active:opacity-60">
              <ShareIcon size={22} color="#333" />
              <Text className="text-gray-600 text-[9px] mt-[2px]">分享</Text>
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
    </View>
  )
}
