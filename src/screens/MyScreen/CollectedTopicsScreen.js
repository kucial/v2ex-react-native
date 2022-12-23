import { useCallback, useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native'
import { FlashList } from '@shopify/flash-list'
import useSWRInfinite from 'swr/infinite'

import CommonListFooter from '@/components/CommonListFooter'
import { BlockText, Box, InlineBox } from '@/components/Skeleton/Elements'
import { useTheme } from '@/containers/ThemeService'
import { isRefreshing, shouldLoadMore } from '@/utils/swr'

const CollectedTopicRow = (props) => {
  const { data } = props
  const navigation = useNavigation()

  const { styles } = useTheme()

  if (!data) {
    return (
      <View
        className="flex flex-row items-center p-2"
        style={[styles.layer1, styles.border_b, styles.border_light]}>
        <View className="self-start">
          <Box className="w-[24px] h-[24px] rounded" />
        </View>
        <View className="flex-1 pl-2">
          <View className="">
            <BlockText className="text-base" lines={[1, 3]}></BlockText>
            <View className="mt-2 flex flex-row flex-wrap items-center">
              <BlockText className="text-xs" lines={2} />
            </View>
          </View>
        </View>
        <View className="w-[64px] flex flex-row justify-end pr-1">
          <InlineBox className="rounded-full text-xs px-2" width={[26, 36]} />
        </View>
      </View>
    )
  }

  return (
    <Pressable
      className="flex flex-row items-center p-2 active:opacity-60"
      style={[styles.layer1, styles.border_b, styles.border_light]}
      onPress={() => {
        if (data) {
          navigation.push('topic', {
            id: props.data.id,
            brief: props.data,
          })
        }
      }}>
      <View className="self-start">
        {data.member.avatar_normal ? (
          <Pressable
            onPress={() => {
              navigation.push('member', {
                username: data.member.username,
                brief: data.member,
              })
            }}>
            <FastImage
              className="w-[24px] h-[24px] rounded"
              source={{ uri: data.member.avatar_normal }}
            />
          </Pressable>
        ) : (
          <Box className="w-[24px] h-[24px] rounded" />
        )}
      </View>
      <View className="flex-1 pl-2">
        <View className="">
          <Text className="text-base" style={styles.text}>
            {data.title}
          </Text>
          <View className="mt-2 flex flex-row flex-wrap items-center">
            <Pressable
              hitSlop={4}
              className="py-[2px] px-[6px] rounded active:opacity-60"
              style={styles.layer3}
              onPress={() => {
                navigation.push('node', {
                  name: data.node.name,
                  brief: data.node,
                })
              }}>
              <Text className="text-xs" style={styles.text_meta}>
                {data.node.title}
              </Text>
            </Pressable>
            <Text className="px-1" style={styles.text_meta}>
              •
            </Text>
            <Pressable
              className="px-1 active:opacity-60"
              hitSlop={4}
              onPress={() => {
                navigation.push('member', {
                  username: data.member.username,
                })
              }}>
              <Text className="text-xs font-bold" style={styles.text_desc}>
                {data.member.username}
              </Text>
            </Pressable>
            <Text className="px-1" style={styles.text_meta}>
              •
            </Text>

            <Text className="text-xs" style={styles.text_meta}>
              {data?.last_reply_time}
            </Text>
            {data?.last_reply_by && (
              <>
                <Text className="px-1" style={styles.text_meta}>
                  •
                </Text>
                <View className="flex flex-row items-center">
                  <Text className="text-xs" style={styles.text_meta}>
                    最后回复来自
                  </Text>
                  <Pressable
                    className="px-1 active:opacity-60"
                    hitSlop={4}
                    onPress={() => {
                      navigation.push('member', {
                        username: data.last_reply_by,
                      })
                    }}>
                    <Text
                      className="text-xs font-bold"
                      style={styles.text_desc}>
                      {data.last_reply_by}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
      <View className="w-[64px] flex flex-row justify-end pr-1">
        {data && !!data.replies && (
          <View className="rounded-full text-xs px-2" style={styles.tag.bg}>
            <Text style={styles.tag.text}>{data.replies}</Text>
          </View>
        )}
      </View>
    </Pressable>
  )
}

export default function CollectedTopicsScreen() {
  const getKey = useCallback((index) => {
    return `/page/my/topics.json?p=${index + 1}`
  }, [])

  const listSwr = useSWRInfinite(getKey)

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
        return <CollectedTopicRow data={item} num={index + 1} />
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
      estimatedItemSize={110}
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
