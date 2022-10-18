import { useEffect } from 'react'
import * as Sentry from 'sentry-expo'
import useSWRBase from 'swr'

import storage from './storage'

export const isRefreshing = (swrState) => {
  // once fetched  && isValidating
  return (
    ((swrState.data || swrState.error) &&
      swrState.isValidating &&
      (!swrState.size || swrState.size === 1)) ||
    false
  )
}

export const hasReachEnd = (listSwr) => {
  if (!listSwr.data?.length) {
    return false
  }
  const pagination = listSwr.data[0].pagination || { total: 1 }
  if (pagination.total > listSwr.size) {
    return false
  }
  return !listSwr.isValidating
}

const CACHE_TTL = 5 // min
const maybeOutdated = (data) => {
  // infinite swr
  let fetchedAt
  if (Array.isArray(data)) {
    fetchedAt = data[0]?.fetchedAt
  } else {
    fetchedAt = data.fetchedAt
  }
  return (
    fetchedAt &&
    Date.now() - new Date(fetchedAt).valueOf() > 1000 * 60 * CACHE_TTL
  )
}

export const shouldFetch = (swr) => {
  if (swr.data && maybeOutdated(swr.data)) {
    console.log('fetch as data maybe outdated')
    return true
  }
  if (!swr.data && !swr.isValidating) {
    console.log('init fetch')
    return true
  }
  return false
}

// 自定义 revalidateOnMount 行为。
export const useSWR = (...args) => {
  let options = {
    revalidateOnMount: false,
    shouldRetryOnError: false,
    initOnMount: true
  }
  const key = args[0]
  const lastArg = args[args.length - 1]
  let swr
  if (typeof lastArg === 'object') {
    options = {
      ...options,
      ...args[1]
    }
    swr = useSWRBase(...args.slice(0, -1), options)
  } else {
    swr = useSWRBase(...args, options)
  }

  useEffect(() => {
    if (
      key &&
      options.revalidateOnMount === false &&
      options.initOnMount &&
      shouldFetch(swr)
    ) {
      swr.mutate()
    }
  }, [key])
  return swr
}

export const isLoadingMore = (swr) => {
  return swr.isValidating && !!swr.data && swr.size > 1
}
export const isLoading = (swr) => swr.isValidating
export const isInitLoading = (swr) =>
  swr.data === undefined && swr.error === undefined && swr.isValidating

export const shouldShowError = (swr) => {
  return swr.error && !swr.isValidating
}

export const isEmptyList = (swr) => {
  return Array.isArray(swr.data) && swr.data.every((p) => p.data?.length === 0)
}

export const cacheProvider = (cache) => {
  const swrCache = {
    get: (key) => {
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
    set: (key, value) => {
      cache.set(key, value)
      // skip swr state info cache
      if (typeof key === 'string' && !/^\$swr\$/.test(key)) {
        Sentry.Native.addBreadcrumb({
          type: 'info',
          data: value
        })
        storage.set(key, JSON.stringify(value))
      }
    },
    delete: (key) => {
      cache.delete(key)

      if (typeof key === 'string' && storage.contains(key)) {
        storage.delete(key)
      }
    },
    flush: () => {
      storage.clearAll()
    }
  }

  return swrCache
}
