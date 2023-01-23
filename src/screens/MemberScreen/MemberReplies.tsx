import { useCallback, useMemo } from 'react'
import { Pressable, Text, useWindowDimensions, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { FlashList } from '@shopify/flash-list'
import PropTypes from 'prop-types'
import useSWRInfinite from 'swr/infinite'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import CommonListFooter from '@/components/CommonListFooter'
import HtmlRender from '@/components/HtmlRender'
import { BlockText, InlineText } from '@/components/Skeleton/Elements'
import { useTheme } from '@/containers/ThemeService'
import { isRefreshing, shouldLoadMore } from '@/utils/swr'
import { getMemberReplies } from '@/utils/v2ex-client'

const MemberReplyRow = (props: RepliedFeedRowProps) => {
  const { width } = useWindowDimensions()
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { data } = props
  const { styles } = useTheme()
  if (data) {
    return (
      <View
        className="w-full"
        style={[styles.layer1, styles.border_b, styles.border_light]}>
        <View className="p-1">
          <View className="px-2 pb-1 pt-2" style={styles.layer2}>
            <View className="flex flex-row">
              <View className="flex-1">
                <Text
                  className="text-xs"
                  style={
                    styles.text_meta
                  }>{`回复了${data.member?.username} 创建的主题 › `}</Text>
              </View>
              <Text className="text-xs" style={styles.text_meta}>
                {data.reply_time}
              </Text>
            </View>
            <Pressable
              className="active:opacity-60"
              onPress={() => {
                navigation.push('topic', {
                  id: data.id,
                })
              }}>
              <Text className="my-1" style={styles.text}>
                {data.title}
              </Text>
            </Pressable>
          </View>
        </View>
        <View className="pt-1 pb-2 px-3">
          <HtmlRender
            navigation={navigation}
            contentWidth={width - 24}
            source={{
              html: data.reply_content_rendered,
              baseUrl: 'https://v2ex.com',
            }}
          />
        </View>
      </View>
    )
  }
  return (
    <View
      className="w-full"
      style={[styles.layer1, styles.border_b, styles.border_light]}>
      <View className="p-1">
        <View className="px-1 pb-1 pt-1 rounded-sm" style={styles.layer2}>
          <InlineText className="text-xs" width="80%"></InlineText>
          <BlockText lines={[1, 2]} />
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
    (index: number): [string, string, number] => {
      return ['/page/member/:username/replies.json', props.username, index + 1]
    },
    [props.username],
  )

  const listSwr = useSWRInfinite(
    getKey,
    ([_, username, page]) => getMemberReplies({ username, p: page }),
    {
      shouldRetryOnError: false,
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
        return <MemberReplyRow data={item} />
      },
      keyExtractor(item, index) {
        return item?.reply_content_rendered || index
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
      estimatedItemSize={124}
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
MemberReplies.propTypes = {
  username: PropTypes.string,
}
