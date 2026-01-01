import { createContext, useContext, useMemo } from 'react'

import { useViewedTopicsStore, ViewedTopicSummary } from '@/stores/viewedTopics'
import { TopicDetail } from '@/utils/v2ex-client/types'

import { useAppSettings } from '../AppSettingsService'

interface ViewedTopicsService {
  hasViewed: (id: string | number) => boolean
  getViewedStatus(
    topic: Pick<TopicDetail, 'id' | 'replies'>,
  ): 'viewed' | 'has_update' | undefined
  getItems: () => ViewedTopicSummary[]
  clear: () => void
  touchViewed: (item: TopicDetail) => void
  removeItem: (item: ViewedTopicSummary) => void
}

export const ViewedTopicsContext = createContext<ViewedTopicsService>(null)

export default function ViewedTopicsServiceProvider(props) {
  const ids = useViewedTopicsStore((state) => state.ids)
  const data = useViewedTopicsStore((state) => state.data)
  const clear = useViewedTopicsStore((state) => state.clear)
  const touchViewed = useViewedTopicsStore((state) => state.touchViewed)
  const removeItem = useViewedTopicsStore((state) => state.removeItem)
  const {
    data: { showHasViewed, showHasNewReply, historyRecordLimit },
  } = useAppSettings()

  const service: ViewedTopicsService = useMemo(() => {
    return {
      getItems: () => ids.map((id) => data[id]),
      hasViewed: (id) => showHasViewed && !!data[id],
      getViewedStatus: (params) => {
        if (!showHasViewed || !params) {
          return undefined
        }
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
      },
      clear,
      touchViewed: (topic) => touchViewed(topic, historyRecordLimit),
      removeItem,
    }
  }, [
    ids,
    data,
    clear,
    touchViewed,
    removeItem,
    showHasViewed,
    showHasNewReply,
    historyRecordLimit,
  ])

  return (
    <ViewedTopicsContext.Provider value={service}>
      {props.children}
    </ViewedTopicsContext.Provider>
  )
}

export const useViewedTopics = () => useContext(ViewedTopicsContext)
