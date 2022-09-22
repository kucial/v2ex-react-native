import {
  FlatList,
  RefreshControl,
  View,
  Text,
  Image,
  useWindowDimensions,
  Pressable
} from 'react-native'
import React, { useMemo } from 'react'
import useSWRInfinite from 'swr/infinite'
import { useNavigation } from '@react-navigation/native'
import CommonListFooter from '@/components/CommonListFooter'
import { hasReachEnd } from '@/utils/swr'
import HtmlRender from '@/components/HtmlRender'
import { Box, BlockText } from '@/components/Skeleton/Elements'
import { useAuthService } from '@/containers/AuthService'

const htmlBaseStyle = {
  lineHeight: 18
}

const NotificationRow = (props) => {
  const { data } = props
  const navigation = useNavigation()
  const { width } = useWindowDimensions()
  if (!data) {
    return (
      <View className="border-b border-b-gray-300 bg-white flex flex-row items-start active:opacity-60 p-2">
        <View className="mr-2">
          <Box className="w-[24px] h-[24px] rounded" />
        </View>
        <View className="flex-1">
          <View className="flex flex-row">
            <BlockText lines={2} className="leading-5" />
          </View>
          <View className="bg-gray-100 mt-1 p-1 rounded">
            <BlockText lines={[1, 3]} className="leading-5 text-gray-200" />
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="border-b border-b-gray-300 bg-white flex flex-row items-start active:opacity-60 p-2">
      <View className="mr-2">
        <Pressable
          hitSlop={4}
          className="active:opacity-60"
          onPress={() => {
            navigation.push('member', {
              username: data.member.username,
              brief: data.member
            })
          }}>
          <Image
            source={{
              uri: data.member.avatar_normal
            }}
            className="w-[24px] h-[24px] rounded"
          />
        </Pressable>
      </View>
      <View className="flex-1">
        <View className="flex flex-row">
          <Text className="leading-5 text-gray-400">
            <Text
              className="text-gray-600 font-medium"
              onPress={() => {
                navigation.push('member', {
                  username: data.member.username,
                  brief: data.member
                })
              }}>
              {data.member.username}
            </Text>
            <Text className="">{' 在 '}</Text>
            <Text
              className="text-gray-600"
              style={{ paddingHorizontal: 8 }}
              onPress={() => {
                navigation.push('topic', {
                  id: data.topic.id
                })
              }}>
              {data.topic.title}
            </Text>
            <Text>{' 里回复了你 '}</Text>
            <Text className="text-gray-300">{data.reply_time}</Text>
          </Text>
        </View>
        {data.content_rendered && (
          <View className="bg-gray-100 mt-1 p-1 rounded">
            <HtmlRender
              contentWidth={width - 24 - 8 - 8 - 8}
              source={{
                html: data.content_rendered,
                baseUrl: 'https://v2ex.com'
              }}
              baseStyle={htmlBaseStyle}
            />
          </View>
        )}
      </View>
    </View>
  )
}

export default function NotificationScreen() {
  const { updateMeta } = useAuthService()
  const listSwr = useSWRInfinite(
    (index) => `/page/notifications.json?p=${index + 1}`,
    {
      onSuccess: () => {
        updateMeta({
          unread_count: 0
        })
      }
    }
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

  const { renderItem, keyExtractor } = useMemo(() => {
    return {
      renderItem({ item, index }) {
        return <NotificationRow data={item} num={index + 1} />
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
    />
  )
}
