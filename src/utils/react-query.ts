import { UseInfiniteQueryResult, UseQueryResult } from '@tanstack/react-query'

import { PaginatedResponse } from './v2ex-client/types'

export const isRefreshing = (
  queryResult: UseInfiniteQueryResult | UseQueryResult,
) => {
  return queryResult.isRefetching
}

export const hasReachEnd = (queryResult: UseInfiniteQueryResult) => {
  return !queryResult.isError && !queryResult.hasNextPage
}

const maybeOutdated = (data: any, ttl: number) => {
  // infinite queryResult
  let fetchedAt
  if (data?.pages && Array.isArray(data?.pages)) {
    fetchedAt = data?.pages[0]?.fetchedAt
  } else {
    fetchedAt = data.fetchedAt
  }
  return (
    fetchedAt && Date.now() - new Date(fetchedAt).valueOf() > 1000 * 60 * ttl
  )
}

export const shouldFetch = (
  query: UseInfiniteQueryResult | UseQueryResult,
  ttl?: number,
) => {
  // console.log('.....shouldFetch.... check')
  if (query.data && ttl && maybeOutdated(query.data, ttl)) {
    console.log('fetch as data maybe outdated')
    return true
  }
  if (!query.data && !query.isLoading) {
    console.log('init fetch')
    return true
  }
  return false
}

export const shouldLoadMore = (queryResult: UseInfiniteQueryResult) => {
  return (
    !isLoadingMore(queryResult) &&
    !queryResult.error &&
    !hasReachEnd(queryResult)
  )
}

export const isLoadingMore = (queryResult: UseInfiniteQueryResult) => {
  return queryResult.isFetchingNextPage
}
export const isLoading = (queryResult: UseQueryResult) => queryResult.isFetching
export const isInitState = (queryResult: UseQueryResult) =>
  queryResult.data === undefined && queryResult.error === undefined

export const shouldShowError = (queryResult: UseQueryResult) => {
  return queryResult.error && !queryResult.isFetching
}

type DefaultListData = PaginatedResponse<any>
const DEFAULT_EMPTY = (d: DefaultListData) => d.data.length === 0
export const isEmptyList = function isEmptyList<D = DefaultListData>(
  queryResult: UseInfiniteQueryResult<D>,
  isEmptyCollection = DEFAULT_EMPTY,
) {
  return (
    Array.isArray(queryResult.data) &&
    queryResult.data.every((value) => {
      return isEmptyCollection(value as DefaultListData)
    })
  )
}
