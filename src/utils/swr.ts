import { Cache, SWRResponse } from 'swr'
import { SWRInfiniteResponse } from 'swr/infinite'

import storage from './storage'
import { PaginatedResponse } from './v2ex-client/types'

export const isRefreshing = (swrState: SWRInfiniteResponse | SWRResponse) => {
  // once fetched  && isValidating
  if ('size' in swrState) {
    return !!(
      swrState.isValidating &&
      swrState.data &&
      swrState.data.length === swrState.size
    )
  }
  return !!((swrState.data || swrState.error) && swrState.isValidating)
}

export const hasReachEnd = (listSwr: SWRInfiniteResponse) => {
  if (!listSwr.data?.length) {
    return false
  }
  if (listSwr.isValidating) {
    return false
  }
  const pagination = listSwr.data[0].pagination || { total: 1 }
  if (pagination.total > listSwr.size) {
    return false
  }
  return true
}

const maybeOutdated = (data: any, ttl: number) => {
  // infinite swr
  let fetchedAt
  if (Array.isArray(data)) {
    fetchedAt = data[0]?.fetchedAt
  } else {
    fetchedAt = data.fetchedAt
  }
  return (
    fetchedAt && Date.now() - new Date(fetchedAt).valueOf() > 1000 * 60 * ttl
  )
}

export const shouldFetch = (swr: SWRResponse, ttl?: number) => {
  // console.log('.....shouldFetch.... check')
  if (swr.data && ttl && maybeOutdated(swr.data, ttl)) {
    console.log('fetch as data maybe outdated')
    return true
  }
  if (!swr.data && !swr.isValidating) {
    console.log('init fetch')
    return true
  }
  return false
}

export const shouldLoadMore = (listSwr: SWRInfiniteResponse) => {
  return !listSwr.isValidating && !listSwr.error && !hasReachEnd(listSwr)
}

export const isLoadingMore = (swr: SWRInfiniteResponse) => {
  return swr.isValidating && !!swr.data && swr.size > 1
}
export const isLoading = (swr: SWRResponse) => swr.isValidating
export const isInitState = (swr: SWRResponse) =>
  swr.data === undefined && swr.error === undefined
export const isInitLoading = (swr: SWRResponse) =>
  swr.data === undefined && swr.error === undefined && swr.isValidating

export const shouldShowError = (swr: SWRResponse) => {
  return swr.error && !swr.isValidating
}

type DefaultListData = PaginatedResponse<any>
const DEFAULT_EMPTY = (d: DefaultListData) => d.data.length === 0
export const isEmptyList = function isEmptyList<D = DefaultListData>(
  swr: SWRInfiniteResponse<D>,
  isEmptyCollection = DEFAULT_EMPTY,
) {
  return (
    Array.isArray(swr.data) &&
    swr.data.every((value) => {
      return isEmptyCollection(value as DefaultListData)
    })
  )
}

export const cacheProvider = (cache: Cache) => {
  const swrCache: Cache = {
    keys: () => {
      return cache.keys()
    },
    get: (key: string) => {
      const valueFromMap = cache.get(key)

      if (valueFromMap) {
        return valueFromMap
      }

      if (typeof key === 'string' && storage.contains(key)) {
        const value = storage.getString(key)
        return value ? JSON.parse(value) : undefined
      }

      return undefined
    },
    set: (key: string, value) => {
      cache.set(key, value)
      // 不缓存状态数据（强行退出时状态为 isValidating=true，无法重新刷新）
      if (value.isValidating || value.isLoading) {
        return
      }
      // 不缓存临时状态
      if (/\$tmp\$/.test(key)) {
        storage.delete(key)
        return
      }

      if (typeof key !== 'string') {
        console.log(key)
      }
      if (typeof key === 'string' && value) {
        storage.set(key, JSON.stringify(value))
      }
    },
    delete: (key: string) => {
      cache.delete(key)

      if (typeof key === 'string' && storage.contains(key)) {
        storage.delete(key)
      }
    },
  }

  return swrCache
}
