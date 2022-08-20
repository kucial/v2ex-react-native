import { useEffect } from 'react'
import useSWRBase from 'swr'

export const isRefreshing = (swrState) => {
  // once fetched  && isValidating
  return (
    (swrState.data || swrState.error) &&
    swrState.isValidating &&
    (!swrState.size ||
      swrState.size === 1 ||
      swrState.size === swrState.data?.length)
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
export const useSWR = (
  key,
  options = {
    revalidateOnMount: false,
    shouldRetryOnError: false
  }
) => {
  const swr = useSWRBase(key, options)
  useEffect(() => {
    if (options.revalidateOnMount === false && shouldInit(swr)) {
      swr.mutate()
    }
  }, [])
  return swr
}

export const isLoadingMore = (swr) => {
  return swr.isValidating && !!swr.data
}
export const isLoading = (swr) => swr.isValidating
export const shouldShowError = (swr) => {
  return swr.error && !swr.isValidating
}

export const isEmptyList = (swr) => {
  return Array.isArray(swr.data) && swr.data.every((p) => p.data?.length === 0)
}
