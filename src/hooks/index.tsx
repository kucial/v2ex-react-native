import { useMemo } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { useAuthStatus, useAuthStore } from '@/stores/auth'
import {
  getHomeFeeds,
  getHomeTabs,
  getHotTopics,
  getMemberTopics,
  getMyCollectedNodes,
  getNodeFeeds,
  getPlanetFeeds,
  getPlanetInfo,
  getPlanetSiteFeeds,
  getRecentFeeds,
  getXnaFeeds,
} from '@/utils/v2ex-client'
import { HomeTabOption } from '@/utils/v2ex-client/types'

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

export const PLANET_FEED_LIST_KEY = '/page/home/planet'
export const usePlanetFeed = (enabled: boolean) => {
  return useInfiniteQuery({
    queryKey: [PLANET_FEED_LIST_KEY],
    queryFn: async ({ pageParam }) => {
      return getPlanetFeeds({ p: pageParam })
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

export const usePlanetInfo = (address: string) => {
  return useQuery({
    queryKey: ['/page/planet/:address/info.json', address],
    queryFn: () => getPlanetInfo(address),
  })
}

export const usePlanetSiteFeed = (address: string) => {
  return useInfiniteQuery({
    queryKey: ['/page/planet/:address/feed.json', address],
    queryFn: async ({ pageParam }) => {
      return getPlanetSiteFeeds({ address, p: pageParam })
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

export const useCollectedNodesQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: ['/page/my/nodes.json'],
    queryFn: getMyCollectedNodes,
    enabled,
  })
}

const TODAY_HOT_TAB: HomeTabOption = {
  value: 'today_hots',
  label: '今日热议',
  type: 'home',
  disabled: true,
}
const PLANET_TAB: HomeTabOption = {
  value: 'planet',
  label: 'Planet',
  type: 'planet',
}

export const useHomeTabs = () => {
  return useQuery({
    queryKey: ['/page/home/tabs.json'],
    queryFn: async () => {
      const { data } = await getHomeTabs()
      const mapped: HomeTabOption[] = [
        {
          value: 'recent',
          label: '最近',
          type: 'home',
        } as HomeTabOption,
        TODAY_HOT_TAB,
        PLANET_TAB,
        ...data,
      ].filter((item) => item.value !== 'nodes')
      return mapped
    },
  })
}

export const useTabOptions = () => {
  const { data: homeTabs } = useHomeTabs()
  const status = useAuthStatus()
  const { data: collectedNodes } = useCollectedNodesQuery(status === 'authed')
  return useMemo(() => {
    if (!homeTabs && !collectedNodes) {
      return null
    }
    return [
      ...(homeTabs || []),
      ...(collectedNodes?.data || []).map((node) => ({
        type: 'node',
        value: node.name,
        label: node.title,
        disabled: true,
      })),
    ] as HomeTabOption[]
  }, [homeTabs, collectedNodes])
}

// TODO...
// export const useMyHomeTabs = () => {

// }
