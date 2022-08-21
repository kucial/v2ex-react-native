import { useEffect } from 'react'
import useSWRBase from 'swr'
import storage from './storage'

export const isRefreshing = (swrState) => {
  // once fetched  && isValidating
  return (
    (swrState.data || swrState.error) &&
    swrState.isValidating &&
    (!swrState.size || swrState.size === 1)
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

export const shouldInit = (swr) => !swr.data && !swr.isValidating

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
    options = args[1]
    swr = useSWRBase(...args)
  } else {
    swr = useSWRBase(...args, options)
  }

  useEffect(() => {
    if (
      key &&
      options.revalidateOnMount === false &&
      options.initOnMount &&
      shouldInit(swr)
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

export const clearStateCache = () => {
  const keys = storage.getAllKeys()
  keys.forEach((key) => {
    if (/^\$swr\$/.test(key)) {
      storage.delete(key)
    }
  })
}
