import { useCallback, useMemo } from 'react'
import { Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { stringify } from 'qs'
import useSWRInfinite, { SWRInfiniteResponse } from 'swr/infinite'

import CommonListFooter from '@/components/CommonListFooter'
import MyRefreshControl from '@/components/MyRefreshControl'
import { useTheme } from '@/containers/ThemeService'
import { isRefreshing } from '@/utils/swr'
import * as v2exClient from '@/utils/v2ex-client'
import { SearchHit } from '@/utils/v2ex-client/types'

import { SearchParams } from '../types'
import ResultRow from './ResultRow'

const SIZE = 20

const isEmpty = (data: any) => {
  return data.hits?.length === 0
}

// 完全加载
const hasReachEnd = (listSwr: SWRInfiniteResponse) => {
  if (!listSwr.data?.length) {
    return false
  }
  if (listSwr.isValidating) {
    return false
  }
  const total = listSwr.data[0]?.total
  const loaded = listSwr.data.reduce((prev, page) => prev + page.hits.length, 0)
  return loaded >= total
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

  const listSwr = useSWRInfinite(
    (index) => ['sove2x-search', stringify(props.params), index],
    ([_, id, index]) => {
      return v2exClient.search({
        ...props.params,
        size: SIZE,
        from: index * SIZE,
      })
    },
    {
      // initialSize: Math.max(1, Math.ceil((topic?.replies || 0) / 100)),
      revalidateOnMount: true,
      revalidateOnFocus: false,
      onErrorRetry(err) {
        if (err.code === 'RESOURCE_ERROR') {
          return
        }
      },
    },
  )

  const items = useMemo(() => {
    if (!listSwr.data) {
      return []
    }
    return listSwr.data.reduce(
      (prev, page) => [...prev, ...page.hits],
      [] as SearchHit[],
    )
  }, [listSwr.data])

  const total = listSwr.data?.[0].total
  const handleReachEnd = useCallback(() => {
    if (!listSwr.data) {
      return
    }
    if (!listSwr.isValidating && items.length < total) {
      listSwr.setSize(listSwr.size + 1)
    }
  }, [listSwr, items, total])

  return (
    <FlashList
      className="flex-1"
      key={stringify(props.params)}
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={140}
      onEndReachedThreshold={0.4}
      onEndReached={handleReachEnd}
      ListHeaderComponent={() => {
        if (total !== undefined) {
          return (
            <View
              className="px-3 py-2"
              style={[styles.layer1, styles.border_b_light]}>
              <Text style={styles.text_meta}>共计 {total} 个结果</Text>
            </View>
          )
        }
        return null
      }}
      ListFooterComponent={() => {
        return (
          <CommonListFooter
            data={listSwr}
            isEmpty={isEmpty}
            hasReachEnd={hasReachEnd(listSwr)}
          />
        )
      }}
      refreshControl={
        <MyRefreshControl
          onRefresh={() => {
            if (listSwr.isValidating) {
              return
            }
            listSwr.mutate()
          }}
          refreshing={isRefreshing(listSwr)}
        />
      }
      scrollEventThrottle={16}
    />
  )
}
