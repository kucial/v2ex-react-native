import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { remoteDevtools } from '@/utils/remoteDevtools'
import { stateStorage } from '@/utils/storage'
import {
  MemberBasic,
  NodeBasic,
  TopicDetail,
  TopicId,
  ViewedTopic,
} from '@/utils/v2ex-client/types'

export type ViewedTopicSummary = {
  id: TopicId
  title: string
  // content_rendered: string
  replies: number
  node: Pick<NodeBasic, 'name' | 'title'>
  member: Pick<MemberBasic, 'username' | 'avatar_normal'>
  viewed_at: number
}

type ViewedTopicState = {
  version: string
  ids: TopicId[]
  data: Record<TopicId, ViewedTopicSummary>
}

type ViewedTopicsStore = ViewedTopicState & {
  clear: () => void
  touchViewed: (item: TopicDetail, historyRecordLimit?: number) => void
  removeItem: (item: TopicDetail) => void
}

export const VIEWED_TOPICS_CACHE_KEY = '$app$/viewed-topics'

export const INIT_VIEWED_TOPICS_STATE: ViewedTopicState = {
  version: 'v2',
  ids: [],
  data: {},
}

const toViewedTopicSummary = (
  topic: TopicDetail,
  viewedAt?: number,
): ViewedTopicSummary => ({
  id: topic.id,
  title: topic.title,
  // content_rendered: topic.content_rendered,
  replies: topic.replies,
  node: {
    name: topic.node.name,
    title: topic.node.title,
  },
  member: {
    username: topic.member.username,
    avatar_normal: topic.member.avatar_normal,
  },
  viewed_at: viewedAt ?? Date.now(),
})

const mappedToV2 = (list: ViewedTopic[]): ViewedTopicState => {
  const ids: TopicId[] = []
  const data: Record<TopicId, ViewedTopicSummary> = {}
  list.forEach((topic) => {
    ids.push(topic.id)
    data[topic.id] = toViewedTopicSummary(topic, topic.viewed_at)
  })
  return {
    ...INIT_VIEWED_TOPICS_STATE,
    ids,
    data,
  }
}

const normalizePersistedState = (persistedState: unknown): ViewedTopicState => {
  if (Array.isArray(persistedState)) {
    return mappedToV2(persistedState as ViewedTopic[])
  }
  if (persistedState && typeof persistedState === 'object') {
    const state = persistedState as Partial<ViewedTopicState>
    if (state.version === 'v2') {
      const normalizedData: Record<TopicId, ViewedTopicSummary> = {}
      if (state.data) {
        Object.entries(state.data).forEach(([id, topic]) => {
          if (topic) {
            const viewedAt =
              (topic as ViewedTopicSummary).viewed_at ??
              (topic as ViewedTopic).viewed_at
            normalizedData[id] = toViewedTopicSummary(
              topic as TopicDetail,
              viewedAt,
            )
          }
        })
      }
      return {
        ...INIT_VIEWED_TOPICS_STATE,
        ...state,
        data: normalizedData,
      }
    }
    if (Array.isArray(state.ids) && state.data) {
      const normalizedData: Record<TopicId, ViewedTopicSummary> = {}
      Object.entries(state.data).forEach(([id, topic]) => {
        if (topic) {
          const viewedAt =
            (topic as ViewedTopicSummary).viewed_at ??
            (topic as ViewedTopic).viewed_at
          normalizedData[id] = toViewedTopicSummary(
            topic as TopicDetail,
            viewedAt,
          )
        }
      })
      return {
        ...INIT_VIEWED_TOPICS_STATE,
        ...state,
        version: 'v2',
        data: normalizedData,
      }
    }
  }
  return INIT_VIEWED_TOPICS_STATE
}

export const useViewedTopicsStore = create<ViewedTopicsStore>()(
  remoteDevtools(
    persist(
      (set) => ({
        ...INIT_VIEWED_TOPICS_STATE,
        clear: () => set(() => INIT_VIEWED_TOPICS_STATE),
        touchViewed: (topic, historyRecordLimit) => {
          set(
            (prev) => {
              const index = prev.ids.findIndex(
                (id) => String(id) === String(topic.id),
              )
              let updatedIds: TopicId[]
              if (index === -1) {
                updatedIds = [topic.id, ...prev.ids]
              } else {
                updatedIds = [
                  topic.id,
                  ...prev.ids.slice(0, index),
                  ...prev.ids.slice(index + 1),
                ]
              }
              const data = {
                ...prev.data,
                [topic.id]: toViewedTopicSummary(topic, Date.now()),
              }
              if (
                historyRecordLimit &&
                updatedIds.length > historyRecordLimit
              ) {
                const itemsToRemove = updatedIds.slice(historyRecordLimit)
                updatedIds = updatedIds.slice(0, historyRecordLimit)
                itemsToRemove.forEach((id) => {
                  delete data[id]
                })
              }

              return {
                ...prev,
                ids: updatedIds,
                data,
              }
            },
            false,
            { type: 'touchViewed', payload: { id: topic.id } },
          )
        },
        removeItem: (topic) => {
          set(
            (prev) => {
              const { ids, data } = prev
              const index = ids.findIndex(
                (id) => String(id) === String(topic.id),
              )
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
            },
            false,
            { type: 'removeItem', payload: { id: topic.id } },
          )
        },
      }),
      {
        name: VIEWED_TOPICS_CACHE_KEY,
        storage: createJSONStorage(() => stateStorage),
        partialize: (state) => ({
          version: state.version,
          ids: state.ids,
          data: state.data,
        }),
        merge: (persistedState, currentState) => ({
          ...currentState,
          ...normalizePersistedState(persistedState),
        }),
      },
    ),
    {
      name: 'viewed-topics-store',
    },
  ),
)
