import { useCallback, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { useInfiniteQuery } from '@tanstack/react-query'
import { stringify } from 'qs'

import CommonListFooter from '@/components/CommonListFooter'
import Loader from '@/components/Loader'
import MyRefreshControl from '@/components/MyRefreshControl'

import { useTheme } from '@/containers/ThemeService'
import * as v2exClient from '@/utils/v2ex-client'
import { SearchHit } from '@/utils/v2ex-client/types'

import { SearchParams } from '../types'
import ResultRow from './ResultRow'

const SIZE = 20

const isEmpty = (data: any) => {
  return data.hits?.length === 0
}

export default function SearchResultView(props: { params: SearchParams }) {
  const { styles } = useTheme()
  const { renderItem, keyExtractor } = useMemo(() => {
    return {
      renderItem({ item, index }: { item: SearchHit; index: number }) {
        return <ResultRow data={item} key={item._id} />
      },
      keyExtractor(item: SearchHit, index: number) {
        return `${item?._source.id}` || `index-${index}`
      },
    }
  }, [props.params])

  const fetchItems = useCallback(
    async ({ pageParam }) => {
      return v2exClient.search({
        ...props.params,
        size: SIZE,
        from: pageParam,
      })
    },
    [props.params],
  )

  const listQuery = useInfiniteQuery({
    queryKey: ['sove2x-search', stringify(props.params)],
    queryFn: fetchItems,
    initialPageParam: 0,
    getNextPageParam(lastPage, _, lastPageParam) {
      if (lastPageParam + SIZE < lastPage.total) {
        return lastPageParam + SIZE
      }
      return undefined
    },
    refetchOnMount: true,
  })

  const items = useMemo(() => {
    if (!listQuery.data) {
      return []
    }
    return listQuery.data?.pages.reduce(
      (prev, page) => [...prev, ...page.hits],
      [] as SearchHit[],
    )
  }, [listQuery.data])

  const total = listQuery.data?.pages?.[0].total
  const handleReachEnd = useCallback(() => {
    if (!listQuery.data) {
      return
    }
    if (!listQuery.isFetching && items.length < total) {
      listQuery.fetchNextPage()
    }
  }, [listQuery, items, total])

  return (
    <FlashList
      style={searchResultStyles.list}
      key={stringify(props.params)}
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReachedThreshold={0.4}
      onEndReached={handleReachEnd}
      ListHeaderComponent={() => {
        if (total !== undefined) {
          return (
            <View
              style={[
                searchResultStyles.headerWrap,
                styles.layer1,
                styles.border_b_light,
              ]}
            >
              <Text style={styles.text_meta}>共计 {total} 个结果</Text>
            </View>
          )
        }
        return (
          <View style={searchResultStyles.loaderWrap}>
            <Loader />
          </View>
        )
      }}
      ListFooterComponent={() => {
        return (
          <CommonListFooter
            data={listQuery}
            isEmpty={isEmpty}
            hasReachEnd={!listQuery.hasNextPage}
          />
        )
      }}
      refreshControl={
        <MyRefreshControl
          refreshing={listQuery.isRefetching}
          onRefresh={listQuery.refetch}
        />
      }
      scrollEventThrottle={16}
    />
  )
}

const searchResultStyles = StyleSheet.create({
  list: {
    flex: 1,
  },
  headerWrap: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  loaderWrap: {
    paddingVertical: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
