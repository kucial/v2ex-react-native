import { useCallback, useMemo } from 'react'
import { Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import useSWRInfinite from 'swr/infinite'

import CommonListFooter from '@/components/CommonListFooter'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import MyRefreshControl from '@/components/MyRefreshControl'
import { useTheme } from '@/containers/ThemeService'
import { isRefreshing, shouldLoadMore } from '@/utils/swr'
import { getBalanceDetail } from '@/utils/v2ex-client'

export default function Balance(props: { username: string }) {
  const { theme, styles } = useTheme()
  const getKey = useCallback(
    (index: number): [string, number] => {
      return [`/member/${props.username}/balance`, index + 1]
    },
    [props.username],
  )
  const listSwr = useSWRInfinite(
    getKey,
    async ([_, page]) => {
      return getBalanceDetail({ p: page })
    },
    {
      revalidateOnMount: true,
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  )

  const listItems = useMemo(() => {
    if (!listSwr.data) {
      // initial loading
      return new Array(10)
    }
    const items = listSwr.data?.reduce((combined, page) => {
      if (page.data) {
        return [...combined, ...page.data]
      }
      return combined
    }, [])
    return items || []
  }, [listSwr])

  const { renderItem, keyExtractor } = useMemo(
    () => ({
      renderItem: ({ item, index }) => {
        if (!item) {
          return (
            <MaxWidthWrapper>
              <View
                style={[
                  index % 2 ? styles.layer1 : null,
                  styles.border_t_light,
                  {
                    height: 58,
                  },
                ]}></View>
            </MaxWidthWrapper>
          )
        }
        return (
          <MaxWidthWrapper>
            <View
              style={[
                index % 2 ? styles.layer1 : null,
                styles.border_t_light,
                {
                  paddingLeft: 8,
                  paddingRight: 8,
                },
              ]}>
              <View className="flex flex-row">
                <View
                  style={{ flex: 2, paddingHorizontal: 4, paddingVertical: 6 }}>
                  <Text style={styles.text}>{item.time}</Text>
                </View>
                <View
                  style={{ flex: 2, paddingHorizontal: 4, paddingVertical: 6 }}>
                  <Text style={styles.text}>{item.type}</Text>
                </View>
                <View
                  style={{ flex: 1, paddingHorizontal: 4, paddingVertical: 6 }}>
                  <Text
                    style={{
                      color:
                        item.amount > 0
                          ? theme.colors.success
                          : theme.colors.danger,
                      textAlign: 'center',
                    }}>
                    {item.amount}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    paddingHorizontal: 4,
                    paddingVertical: 6,
                  }}>
                  <Text
                    style={[
                      styles.text,
                      {
                        textAlign: 'center',
                      },
                    ]}>
                    {item.balance}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  paddingHorizontal: 4,
                  paddingBottom: 8,
                }}>
                <Text style={styles.text_desc}>{item.description}</Text>
              </View>
            </View>
          </MaxWidthWrapper>
        )
      },
      keyExtractor: (item, index) => {
        return item ? `${item.type}-${item.time}` : index
      },
    }),
    [styles],
  )

  return (
    <FlashList
      data={listItems}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      estimatedItemSize={58}
      onEndReached={() => {
        if (shouldLoadMore(listSwr)) {
          listSwr.setSize((size) => size + 1)
        }
      }}
      refreshControl={
        <MyRefreshControl
          refreshing={isRefreshing(listSwr) || false}
          onRefresh={() => {
            if (!listSwr.isValidating) {
              listSwr.setSize(1)
              listSwr.mutate()
            }
          }}
        />
      }
      ListHeaderComponent={() => <View className="h-[16]"></View>}
      // TODO: 在头部显示显示余额信息
      ListFooterComponent={() => {
        return <CommonListFooter data={listSwr} />
      }}
    />
  )
}
