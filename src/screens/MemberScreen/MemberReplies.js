import {
  FlatList,
  View,
  Text,
  Pressable,
  RefreshControl,
  useWindowDimensions
} from 'react-native'
import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import useSWRInfinite from 'swr/infinite'
import { useNavigation } from '@react-navigation/native'

import CommonListFooter from '@/components/CommonListFooter'
import RenderHtml from '@/components/RenderHtml'
import { BlockText, InlineText } from '@/components/Skeleton/Elements'

import { hasReachEnd } from '@/utils/swr'

const MemberReplyRow = (props) => {
  const { width } = useWindowDimensions()
  const navigation = useNavigation()
  const { data } = props
  if (data) {
    // console.log(data)
    return (
      <View className="w-full bg-white border-b border-b-gray-300">
        <View className="p-1">
          <View className="bg-gray-100 px-2 pb-1 pt-2">
            <View className="flex flex-row">
              <View className="flex-1">
                <Text className="text-gray-600 text-xs">{`回复了${data.topic.member.username} 创建的主题 › `}</Text>
              </View>
              <Text className="text-gray-600 text-xs">{data.reply_time}</Text>
            </View>
            <Pressable
              className="active:opacity-60"
              onPress={() => {
                navigation.push('topic', {
                  id: data.topic.id
                })
              }}>
              <Text className="my-1 text-gray-700">{data.topic.title}</Text>
            </Pressable>
          </View>
        </View>
        <View className="pt-1 pb-2 px-3">
          <RenderHtml
            contentWidth={width - 24}
            source={{
              html: data.content_rendered,
              baseUrl: 'https://v2ex.com'
            }}
          />
        </View>
      </View>
    )
  }
  return (
    <View className="bg-white px-1 border-b border-b-gray-300">
      <View className="p-1">
        <View className="bg-gray-100 px-1 pb-1 pt-1 rounded-sm">
          <InlineText
            className="text-xs text-gray-200"
            width="80%"></InlineText>
          <BlockText className="text-gray-200" lines={[1, 2]} />
        </View>
      </View>
      <View className="py-1 px-2">
        <BlockText lines={[1, 4]} />
      </View>
    </View>
  )
}

export default function MemberReplies(props) {
  const getKey = useCallback(
    (index) => {
      return `/page/member/${props.username}/replies.json?p=${index + 1}`
    },
    [props.username]
  )

  const listSwr = useSWRInfinite(getKey, undefined, {
    shouldRetryOnError: false
  })

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

  const { renderItem, keyExtractor } = useMemo(() => {
    return {
      renderItem({ item, index }) {
        return <MemberReplyRow data={item} num={index + 1} />
      },
      keyExtractor(item, index) {
        return item?.id || index
      }
    }
  }, [])

  console.log(listItems)

  return (
    <FlatList
      className="flex-1"
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
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
      ListFooterComponent={() => {
        return <CommonListFooter data={listSwr} />
      }}
      ListEmptyComponent={() => (
        <View>
          <Text>EMPTY</Text>
        </View>
      )}
    />
  )
}
MemberReplies.propTypes = {
  username: PropTypes.string
}
