import { useCallback, useMemo } from 'react'

import { useAppSettingsStore } from '@/stores/appSettings'
import { useViewedTopicsStore } from '@/stores/viewedTopics'
import { TopicDetail } from '@/utils/v2ex-client/types'

type ViewedStatus = 'viewed' | 'has_update' | undefined

type TopicIdentity = Pick<TopicDetail, 'id' | 'replies'>

const getViewedEntry = (
  data: ReturnType<typeof useViewedTopicsStore.getState>['data'],
  id?: string | number,
) => {
  if (id == null) return undefined
  return data[id]
}

const resolveViewedStatus = ({
  showHasViewed,
  showHasNewReply,
  replies,
  viewedReplies,
}: {
  showHasViewed: boolean
  showHasNewReply: boolean
  replies?: number
  viewedReplies?: number
}): ViewedStatus => {
  if (!showHasViewed || viewedReplies == null) return undefined
  if (!showHasNewReply) return 'viewed'
  if ((viewedReplies ?? 0) < (replies ?? 0)) return 'has_update'
  return 'viewed'
}

export const useViewedItems = () => {
  const ids = useViewedTopicsStore((state) => state.ids)
  const data = useViewedTopicsStore((state) => state.data)

  return useMemo(() => ids.map((id) => data[id]).filter(Boolean), [ids, data])
}

export const useHasViewed = (id?: string | number) => {
  const showHasViewed = useAppSettingsStore((state) => state.data.showHasViewed)
  const viewed = useViewedTopicsStore((state) => getViewedEntry(state.data, id))

  return showHasViewed && !!viewed
}

export const useViewedStatus = (topic?: TopicIdentity): ViewedStatus => {
  const showHasViewed = useAppSettingsStore((state) => state.data.showHasViewed)
  const showHasNewReply = useAppSettingsStore(
    (state) => state.data.showHasNewReply,
  )
  const viewed = useViewedTopicsStore((state) =>
    getViewedEntry(state.data, topic?.id),
  )

  return useMemo(
    () =>
      resolveViewedStatus({
        showHasViewed,
        showHasNewReply,
        replies: topic?.replies,
        viewedReplies: viewed?.replies,
      }),
    [showHasViewed, showHasNewReply, topic?.replies, viewed?.replies],
  )
}

export const useGetViewedStatus = () => {
  const showHasViewed = useAppSettingsStore((state) => state.data.showHasViewed)
  const showHasNewReply = useAppSettingsStore(
    (state) => state.data.showHasNewReply,
  )

  return useCallback(
    (params?: TopicIdentity) => {
      const viewedReplies = params
        ? useViewedTopicsStore.getState().data[params.id]?.replies
        : undefined

      return resolveViewedStatus({
        showHasViewed,
        showHasNewReply,
        replies: params?.replies,
        viewedReplies,
      })
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
