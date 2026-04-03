import { useCallback, useMemo } from 'react'

import { useAppSettingsStore } from '@/stores/appSettings'
import { useViewedTopicsStore } from '@/stores/viewedTopics'
import { TopicDetail } from '@/utils/v2ex-client/types'

export const useViewedItems = () => {
  const ids = useViewedTopicsStore((state) => state.ids)
  const data = useViewedTopicsStore((state) => state.data)

  return useMemo(() => ids.map((id) => data[id]), [ids, data])
}

export const useHasViewed = () => {
  const showHasViewed = useAppSettingsStore((state) => state.data.showHasViewed)

  return useCallback(
    (id: string | number) => {
      if (!showHasViewed) return false
      return !!useViewedTopicsStore.getState().data[id]
    },
    [showHasViewed],
  )
}

export const useGetViewedStatus = () => {
  const showHasViewed = useAppSettingsStore((state) => state.data.showHasViewed)
  const showHasNewReply = useAppSettingsStore(
    (state) => state.data.showHasNewReply,
  )

  return useCallback(
    (params?: Pick<TopicDetail, 'id' | 'replies'>) => {
      if (!showHasViewed || !params) {
        return undefined
      }
      const data = useViewedTopicsStore.getState().data
      if (!showHasNewReply) {
        return data[params.id] ? 'viewed' : undefined
      }
      if (!data[params.id]) {
        return undefined
      }
      if (data[params.id].replies < params.replies) {
        return 'has_update'
      }
      if (data[params.id].replies === params.replies) {
        return 'viewed'
      }
      return undefined
    },
    [showHasViewed, showHasNewReply],
  )
}

export const useClearViewedTopics = () =>
  useViewedTopicsStore((state) => state.clear)

export const useRemoveViewedTopic = () =>
  useViewedTopicsStore((state) => state.removeItem)

export const useTouchViewedTopic = () => {
  const touchViewed = useViewedTopicsStore((state) => state.touchViewed)
  const historyRecordLimit = useAppSettingsStore(
    (state) => state.data.historyRecordLimit,
  )

  return useCallback(
    (topic: TopicDetail) => touchViewed(topic, historyRecordLimit),
    [touchViewed, historyRecordLimit],
  )
}
