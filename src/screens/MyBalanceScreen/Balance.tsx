import { useCallback, useMemo } from 'react'
import { Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useInfiniteQuery } from '@tanstack/react-query'

import CommonListFooter from '@/components/CommonListFooter'
import HtmlRender from '@/components/HtmlRender'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import MyRefreshControl from '@/components/MyRefreshControl'

import { useTheme } from '@/containers/ThemeService'
import { shouldLoadMore } from '@/utils/react-query'
import { getBalanceDetail } from '@/utils/v2ex-client'

export default function Balance(props: { username: string }) {
  const { theme, styles } = useTheme()

  const fetchItems = useCallback(
    async ({ pageParam }) => {
      return getBalanceDetail({
        p: pageParam,
      })
    },
    [props.username],
  )

  const listQuery = useInfiniteQuery({
    queryKey: ['/member/:username/balance', props.username],
    queryFn: fetchItems,
    initialPageParam: 1,
    getNextPageParam(lastPage) {
      if (
        lastPage.pagination &&
        lastPage.pagination.total > lastPage.pagination.current
      ) {
        return lastPage.pagination.current + 1
      }
      return undefined
    },
    refetchOnMount: true,
  })

  const listItems = useMemo(() => {
    if (listQuery.isLoading) {
      // initial loading
      return new Array(10)
    }
    const items = listQuery.data?.pages.reduce((combined, page) => {
      if (page.data) {
        return [...combined, ...page.data]
      }
      return combined
    }, [])
    return items || []
  }, [listQuery])

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
                ]}
              ></View>
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
              ]}
            >
              <View className='flex flex-row'>
                <View
                  style={{ flex: 2, paddingHorizontal: 4, paddingVertical: 6 }}
                >
                  <Text style={styles.text}>{item.time}</Text>
                </View>
                <View
                  style={{ flex: 2, paddingHorizontal: 4, paddingVertical: 6 }}
                >
                  <Text style={styles.text}>{item.type}</Text>
                </View>
                <View
                  style={{ flex: 1, paddingHorizontal: 4, paddingVertical: 6 }}
                >
                  <Text
                    style={{
                      color:
                        item.amount > 0
                          ? theme.colors.success
                          : theme.colors.danger,
                      textAlign: 'center',
                    }}
                  >
                    {item.amount}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    paddingHorizontal: 4,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={[
                      styles.text,
                      {
                        textAlign: 'center',
                      },
                    ]}
                  >
                    {item.balance}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  paddingHorizontal: 4,
                  paddingBottom: 8,
                }}
              >
                <HtmlRender
                  source={{
                    html: item.description,
                    baseUrl: 'https://v2ex.com',
                  }}
                  tagsStyles={{
                    body: styles.text_desc,
                    a: {
                      color: theme.colors.text_desc,
                      textDecorationLine: 'none',
                    },
                  }}
                />
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
      onEndReached={() => {
        if (shouldLoadMore(listQuery)) {
          listQuery.fetchNextPage()
        }
      }}
      refreshControl={
        <MyRefreshControl
          refreshing={listQuery.isRefetching}
          onRefresh={listQuery.refetch}
        />
      }
      ListHeaderComponent={() => <View className='h-[16]'></View>}
      // TODO: 在头部显示显示余额信息
      ListFooterComponent={() => {
        return <CommonListFooter data={listQuery} />
      }}
    />
  )
}
