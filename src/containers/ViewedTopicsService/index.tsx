import { createContext, useContext, useMemo, useState } from 'react'

import { useCachedState } from '@/utils/hooks'
import { TopicDetail, ViewedTopic } from '@/utils/v2ex-client/types'
import { TopicId } from '@/utils/v2ex-client/types'

import { useAppSettings } from '../AppSettingsService'

type ViewedTopicState = {
  version: string
  ids: Array<TopicId>
  data: Record<TopicId, ViewedTopic>
}
const CACHE_KEY = '$app$/viewed-topics'
const INIT_STATE: ViewedTopicState = {
  version: 'v2',
  ids: [],
  data: {},
}

const mappedToV2 = (list: ViewedTopic[]): ViewedTopicState => {
  const ids = []
  const data = {}
  list.forEach((topic: ViewedTopic) => {
    ids.push(topic.id)
    data[topic.id] = topic
  })
  return {
    ...INIT_STATE,
    ids,
    data,
  }
}

interface ViewedTopicsService {
  hasViewed: (id: string | number) => boolean
  getViewedStatus(
    topic: Pick<TopicDetail, 'id' | 'replies'>,
  ): 'viewed' | 'has_update' | undefined
  getItems: () => TopicDetail[]
  clear: () => void
  touchViewed: (item: TopicDetail) => void
  removeItem: (item: TopicDetail) => void
}

export const ViewedTopicsContext = createContext<ViewedTopicsService>(null)

export default function ViewedTopicsService(props) {
  const [state, setState] = useCachedState<ViewedTopicState>(
    CACHE_KEY,
    INIT_STATE,
    (state) => {
      if (state.version === 'v2') {
        return state
      }
      return mappedToV2(state)
    },
  )
  const {
    data: { showHasViewed, showHasNewReply },
  } = useAppSettings()

  const service: ViewedTopicsService = useMemo(() => {
    return {
      getItems: () => state.ids.map((id) => state.data[id]),
      hasViewed: (id) => showHasViewed && !!state.data[id],
      getViewedStatus: (params) => {
        if (!showHasViewed || !params) {
          return undefined
        }
        if (!showHasNewReply) {
          return state.data[params.id] ? 'viewed' : undefined
        }
        if (!state.data[params.id]) {
          return undefined
        }
        if (state.data[params.id].replies < params.replies) {
          return 'has_update'
        }
        if (state.data[params.id].replies === params.replies) {
          return 'viewed'
        }
      },
      clear: () => setState(INIT_STATE),
      touchViewed: (topic) => {
        setState((prev) => {
          const index = prev.ids.findIndex(
            (id) => String(id) === String(topic.id),
          )
          let updatedIds
          if (index === -1) {
            updatedIds = [topic.id, ...prev.ids]
          } else {
            updatedIds = [
              topic.id,
              ...prev.ids.slice(0, index),
              ...prev.ids.slice(index + 1),
            ]
          }
          return {
            ...prev,
            ids: updatedIds,
            data: {
              ...prev.data,
              [topic.id]: {
                ...topic,
                viewed_at: Date.now(),
              },
            },
          }
        })
      },
      removeItem: (topic) => {
        setState((prev) => {
          const { ids, data } = prev
          const index = ids.findIndex((id) => String(id) === String(topic.id))
          if (index > -1) {
            const newIds = [...ids.slice(0, index), ...ids.slice(index + 1)]
            const mapped = { ...data }
            delete mapped[topic.id]
            return {
              ...prev,
              ids: newIds,
              data: mapped,
            }
          }
          return prev
        })
      },
    }
  }, [state, setState])

  return (
    <ViewedTopicsContext.Provider value={service}>
      {props.children}
    </ViewedTopicsContext.Provider>
  )
}

export const useViewedTopics = () => useContext(ViewedTopicsContext)
