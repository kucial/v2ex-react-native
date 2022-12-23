import { useMemo } from 'react'
import { Pressable, Text, useWindowDimensions, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native'
import { FlashList } from '@shopify/flash-list'
import classNames from 'classnames'
import useSWRInfinite from 'swr/infinite'

import CommonListFooter from '@/components/CommonListFooter'
import HtmlRender from '@/components/HtmlRender'
import { BlockText, Box } from '@/components/Skeleton/Elements'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'
import { isRefreshing, shouldLoadMore } from '@/utils/swr'

const htmlBaseStyle = {
  lineHeight: 18,
}

const NotificationRow = (props) => {
  const { data } = props
  const navigation = useNavigation()
  const { width } = useWindowDimensions()
  const { styles, theme } = useTheme()
  if (!data) {
    return (
      <View
        className={classNames(
          'flex flex-row items-start p-2',
          'active:opacity-60',
        )}
        style={[styles.layer1, styles.border_b, styles.border_light]}>
        <View className="mr-2">
          <Box className="w-[24px] h-[24px] rounded" />
        </View>
        <View className="flex-1">
          <View className="flex flex-row">
            <BlockText lines={2} className="leading-5" />
          </View>
          <View className="mt-1 p-1 rounded" style={styles.layer2}>
            <BlockText
              lines={[1, 3]}
              style={{
                color: theme.colors.meta,
                lineHeight: 20,
              }}
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
          <Text className="leading-5" style={styles.text_meta}>
            <Text
              className="font-medium"
              style={styles.text_desc}
              onPress={() => {
                navigation.push('member', {
                  username: data.member.username,
                  brief: data.member,
                })
              }}>
              {data.member.username}
            </Text>
            <Text className="">{' 收藏了你发布的主题 '}</Text>
            <Text
              style={[{ paddingHorizontal: 8 }, styles.text_desc]}
              onPress={() => {
                navigation.push('topic', {
                  id: data.topic.id,
                })
              }}>
              {data.topic.title}
            </Text>
            <Text> </Text>
            <Text className="px-2">{data.time}</Text>
          </Text>
        </View>
      )
      break
    case 'thank':
      header = (
        <View className="flex flex-row">
          <Text className="leading-5" style={styles.text_meta}>
            <Text
              className="font-medium"
              style={styles.text_desc}
              onPress={() => {
                navigation.push('member', {
                  username: data.member.username,
                  brief: data.member,
                })
              }}>
              {data.member.username}
            </Text>
            <Text className="">{' 感谢了你发布的主题 '}</Text>
            <Text
              style={[{ paddingHorizontal: 8 }, styles.text_desc]}
              onPress={() => {
                navigation.push('topic', {
                  id: data.topic.id,
                })
              }}>
              {data.topic.title}
            </Text>
            <Text> </Text>
            <Text className="px-2">{data.time}</Text>
          </Text>
        </View>
      )
      break
    case 'thank_reply':
      header = (
        <View className="flex flex-row">
          <Text className="leading-5" style={styles.text_meta}>
            <Text
              className="font-medium"
              style={styles.text_desc}
              onPress={() => {
                navigation.push('member', {
                  username: data.member.username,
                  brief: data.member,
                })
              }}>
              {data.member.username}
            </Text>
            <Text className="">{' 感谢了你在主题 '}</Text>
            <Text
              style={[{ paddingHorizontal: 8 }, styles.text_desc]}
              onPress={() => {
                navigation.push('topic', {
                  id: data.topic.id,
                })
              }}>
              {data.topic.title}
            </Text>
            <Text>{' 的回复 '}</Text>
            <Text>{data.time}</Text>
          </Text>
        </View>
      )
      break
    case 'reply':
    default:
      header = (
        <View className="flex flex-row">
          <Text className="leading-5" style={styles.text_meta}>
            <Text
              className="font-medium"
              style={styles.text_desc}
              onPress={() => {
                navigation.push('member', {
                  username: data.member.username,
                  brief: data.member,
                })
              }}>
              {data.member.username}
            </Text>
            <Text className="">{' 在 '}</Text>
            <Text
              style={[{ paddingHorizontal: 8 }, styles.text_desc]}
              onPress={() => {
                navigation.push('topic', {
                  id: data.topic.id,
                })
              }}>
              {data.topic.title}
            </Text>
            <Text>{' 里回复了你 '}</Text>
            <Text className="text-sm">{data.time}</Text>
          </Text>
        </View>
      )
  }

  return (
    <View
      sentry-label="NotificationRow"
      className={classNames(
        'flex flex-row items-start p-2',
        'active:opacity-60',
      )}
      style={[styles.layer1, styles.border_b, styles.border_light]}>
      <View className="mr-2">
        <Pressable
          hitSlop={4}
          className="active:opacity-60"
          onPress={() => {
            navigation.push('member', {
              username: data.member.username,
              brief: data.member,
            })
          }}>
          <FastImage
            source={{
              uri: data.member.avatar_normal,
            }}
            className="w-[24px] h-[24px] rounded"
          />
        </Pressable>
      </View>
      <View className="flex-1">
        {header}
        {data.content_rendered && (
          <View className="mt-1 p-1 rounded" style={styles.layer2}>
            <HtmlRender
              contentWidth={width - 24 - 8 - 8 - 8}
              source={{
                html: data.content_rendered,
                baseUrl: 'https://v2ex.com',
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
          unread_count: 0,
        })
      },
    },
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
      },
    }
  }, [])

  return (
    <FlashList
      className="flex-1"
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      estimatedItemSize={80}
      onEndReached={() => {
        if (shouldLoadMore(listSwr)) {
          listSwr.setSize(listSwr.size + 1)
        }
      }}
      onRefresh={() => {
        if (listSwr.isValidating) {
          return
        }
        listSwr.mutate()
      }}
      refreshing={isRefreshing(listSwr)}
      ListFooterComponent={() => {
        return <CommonListFooter data={listSwr} />
      }}
    />
  )
}
