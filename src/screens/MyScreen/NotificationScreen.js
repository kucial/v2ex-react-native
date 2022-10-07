import React, { useMemo } from 'react'
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  useWindowDimensions,
  View
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import classNames from 'classnames'
import useSWRInfinite from 'swr/infinite'

import CommonListFooter from '@/components/CommonListFooter'
import HtmlRender from '@/components/HtmlRender'
import { BlockText, Box } from '@/components/Skeleton/Elements'
import { useAuthService } from '@/containers/AuthService'
import { hasReachEnd } from '@/utils/swr'

const htmlBaseStyle = {
  lineHeight: 18
}

const NotificationRow = (props) => {
  const { data } = props
  const navigation = useNavigation()
  const { width } = useWindowDimensions()
  if (!data) {
    return (
      <View
        className={classNames(
          'border-b flex flex-row items-start active:opacity-60 p-2',
          'border-b-neutral-300 bg-white',
          'dark:bg-neutral-900 dark:border-neutral-600'
        )}>
        <View className="mr-2">
          <Box className="w-[24px] h-[24px] rounded" />
        </View>
        <View className="flex-1">
          <View className="flex flex-row">
            <BlockText lines={2} className="leading-5" />
          </View>
          <View className="bg-neutral-100 dark:bg-neutral-800 mt-1 p-1 rounded">
            <BlockText
              lines={[1, 3]}
              className="leading-5 text-neutral-200 dark:text-neutral-700"
            />
          </View>
        </View>
      </View>
    )
  }

  let header
  switch (data.action) {
    case 'collect':
      header = (
        <View className="flex flex-row">
          <Text className="leading-5 text-neutral-400 dark:text-neutral-500">
            <Text
              className="text-neutral-600 font-medium dark:text-neutral-400"
              onPress={() => {
                navigation.push('member', {
                  username: data.member.username,
                  brief: data.member
                })
              }}>
              {data.member.username}
            </Text>
            <Text className="">{' 收藏了你发布的主题 '}</Text>
            <Text
              className="text-neutral-600 dark:text-neutral-400"
              style={{ paddingHorizontal: 8 }}
              onPress={() => {
                navigation.push('topic', {
                  id: data.topic.id
                })
              }}>
              {data.topic.title}
            </Text>
            <Text> </Text>
            <Text className="px-2 text-neutral-300">{data.time}</Text>
          </Text>
        </View>
      )
      break
    case 'thank':
      header = (
        <View className="flex flex-row">
          <Text className="leading-5 text-neutral-400 dark:text-neutral-500">
            <Text
              className="text-neutral-600 font-medium dark:text-neutral-400"
              onPress={() => {
                navigation.push('member', {
                  username: data.member.username,
                  brief: data.member
                })
              }}>
              {data.member.username}
            </Text>
            <Text className="">{' 感谢了你发布的主题 '}</Text>
            <Text
              className="text-neutral-600 dark:text-neutral-400"
              style={{ paddingHorizontal: 8 }}
              onPress={() => {
                navigation.push('topic', {
                  id: data.topic.id
                })
              }}>
              {data.topic.title}
            </Text>
            <Text> </Text>
            <Text className="px-2 text-neutral-300">{data.time}</Text>
          </Text>
        </View>
      )
      break
    case 'reply':
    default:
      header = (
        <View className="flex flex-row">
          <Text className="leading-5 text-neutral-400 dark:text-neutral-500">
            <Text
              className="text-neutral-600 font-medium dark:text-neutral-400"
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
              className="text-neutral-600 dark:text-neutral-400"
              style={{ paddingHorizontal: 8 }}
              onPress={() => {
                navigation.push('topic', {
                  id: data.topic.id
                })
              }}>
              {data.topic.title}
            </Text>
            <Text>{' 里回复了你 '}</Text>
            <Text className="text-neutral-300">{data.time}</Text>
          </Text>
        </View>
      )
  }

  return (
    <View
      className={classNames(
        'border-b flex flex-row items-start active:opacity-60 p-2',
        'border-b-neutral-300 bg-white',
        'dark:bg-neutral-900 dark:border-neutral-600'
      )}>
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
        {header}
        {data.content_rendered && (
          <View className="bg-neutral-100 mt-1 p-1 rounded dark:bg-neutral-800">
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
