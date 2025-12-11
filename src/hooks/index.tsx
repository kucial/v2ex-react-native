import { useInfiniteQuery } from '@tanstack/react-query'

import {
  getHomeFeeds,
  getHotTopics,
  getMemberTopics,
  getNodeFeeds,
  getRecentFeeds,
  getXnaFeeds,
} from '@/utils/v2ex-client'

export const useHomeTabFeed = (tab: string, enabled: boolean) => {
  return useInfiniteQuery({
    queryKey: ['/page/home/feed', tab],
    queryFn: async ({ pageParam }) => {
      if (tab === 'recent') {
        return getRecentFeeds({ p: pageParam })
      }
      if (tab === 'today_hots') {
        return getHotTopics()
      }
      return getHomeFeeds({ tab })
    },
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
    enabled,
  })
}

export const XNA_LIST_KEY = '/page/home/xna'
export const useXnaFeed = (enabled: boolean) => {
  return useInfiniteQuery({
    queryKey: [XNA_LIST_KEY],
    queryFn: async ({ pageParam }) => {
      return getXnaFeeds({ p: pageParam })
    },
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
    enabled,
  })
}

export const NODE_TOPICS_KEY = '/page/go/:name/feed.json'
export const useNodeTopics = (name: string, enabled: boolean) => {
  return useInfiniteQuery({
    queryKey: [NODE_TOPICS_KEY, name],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      return getNodeFeeds({ name, p: pageParam })
    },
    getNextPageParam(lastPage) {
      if (
        lastPage.pagination &&
        lastPage.pagination.total > lastPage.pagination.current
      ) {
        return lastPage.pagination.current + 1
      }
      return undefined
    },
    enabled,
  })
}

export const MEMBER_TOPICS_KEY = '/page/member/:username/topics.json'
export const useMemberTopics = (username: string, enabled: boolean) => {
  return useInfiniteQuery({
    queryKey: ['/page/member/:username/topics.json', username],
    queryFn: async ({ pageParam }) => {
      return getMemberTopics({ username: username, p: pageParam })
    },
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
  })
}
