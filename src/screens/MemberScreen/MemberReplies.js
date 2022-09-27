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
import { useColorScheme } from 'tailwindcss-react-native'
import colors from 'tailwindcss/colors'

import { useNavigation } from '@react-navigation/native'

import CommonListFooter from '@/components/CommonListFooter'
import HtmlRender from '@/components/HtmlRender'
import { BlockText, InlineText } from '@/components/Skeleton/Elements'

import { hasReachEnd } from '@/utils/swr'

const MemberReplyRow = (props) => {
  const { width } = useWindowDimensions()
  const navigation = useNavigation()
  const { data } = props
  if (data) {
    // console.log(data)
    return (
      <View className="w-full bg-white border-b border-b-neutral-300 dark:bg-neutral-900 dark:border-b-neutral-600">
        <View className="p-1">
          <View className="bg-neutral-100 px-2 pb-1 pt-2 dark:bg-neutral-800">
            <View className="flex flex-row">
              <View className="flex-1">
                <Text className="text-neutral-600 text-xs dark:text-neutral-400">{`回复了${data.topic.member.username} 创建的主题 › `}</Text>
              </View>
              <Text className="text-neutral-600 text-xs dark:text-neutral-400">
                {data.reply_time}
              </Text>
            </View>
            <Pressable
              className="active:opacity-60"
              onPress={() => {
                navigation.push('topic', {
                  id: data.topic.id
                })
              }}>
              <Text className="my-1 text-neutral-700 dark:text-neutral-300">
                {data.topic.title}
              </Text>
            </Pressable>
          </View>
        </View>
        <View className="pt-1 pb-2 px-3">
          <HtmlRender
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
    <View className="bg-white px-1 border-b border-b-neutral-300 dark:bg-neutral-900 dark:border-b-neutral-600">
      <View className="p-1">
        <View className="bg-neutral-100 px-1 pb-1 pt-1 rounded-sm dark:bg-neutral-800">
          <InlineText
            className="text-xs text-neutral-200 dark:text-neutral-600"
            width="80%"></InlineText>
          <BlockText
            className="text-neutral-200 dark:text-neutral-600"
            lines={[1, 2]}
          />
        </View>
      </View>
      <View className="py-1 px-2">
        <BlockText lines={[1, 4]} />
      </View>
    </View>
  )
}

export default function MemberReplies(props) {
  const { colorScheme } = useColorScheme()
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
          tintColor={
            colorScheme === 'dark' ? colors.neutral[300] : colors.neutral[900]
          }
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
