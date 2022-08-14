import { useEffect } from 'react'
import useSWR from 'swr'

export const isRefreshing = (swrState) => {
  // once fetched  && isValidating
  return (swrState.data || swrState.error) && swrState.isValidating
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
export const useCustomSwr = (
  key,
  options = {
    revalidateOnMount: false
  }
) => {
  const swr = useSWR(key, options)
  useEffect(() => {
    if (options.revalidateOnMount === false && shouldInit(swr)) {
      swr.mutate()
    }
  }, [])
  return swr
}
