import { createContext, useContext, useMemo } from 'react'

import { useCachedState } from '@/hooks'

import { useAppSettings } from './AppSettingsService'

const CACHE_KEY = '$app$/viewed-topics'
const INIT_STATE = {
  version: 'v2',
  ids: [],
  data: {}
}

const mappedToV2 = (list) => {
  const ids = []
  const data = {}
  list.forEach((topic) => {
    ids.push(topic.id)
    data[topic.id] = topic
  })
  return {
    ...INIT_STATE,
    ids,
    data
  }
}

export const ViewedTopicsContext = createContext({
  hasViewed: () => false,
  touchViewed: () => undefined
})

export default function ViewedTopicsService(props) {
  const [state, setState] = useCachedState(CACHE_KEY, INIT_STATE)
  const {
    data: { showHasViewed }
  } = useAppSettings()

  const service = useMemo(() => {
    if (state.version === 'v2') {
      return {
        getItems: () => state.ids.map((id) => state.data[id]),
        hasViewed: (id) => showHasViewed && !!state.data[id],
        clear: () => setState(INIT_STATE),
        touchViewed: (topic) => {
          setState((prev) => {
            const index = prev.ids.findIndex(
              (id) => String(id) === String(topic.id)
            )
            let updatedIds
            if (index === -1) {
              updatedIds = [topic.id, ...prev.ids]
            } else {
              updatedIds = [
                topic.id,
                ...prev.ids.slice(0, index),
                ...prev.ids.slice(index + 1)
              ]
            }
            return {
              ...prev,
              ids: updatedIds,
              data: {
                ...prev.data,
                [topic.id]: {
                  ...topic,
                  viewed_at: Date.now()
                }
              }
            }
          })
        }
      }
    }
    // v1 ...
    return {
      getItems: () => state,
      hasViewed: (id) =>
        showHasViewed && state.some((t) => String(t.id) === String(id)),
      clear: () => setState([]),
      touchViewed: (topic) => {
        setState((prev) => {
          const index = prev.findIndex((t) => String(t.id) === String(topic.id))
          let newCache
          if (index === -1) {
            newCache = [{ ...topic, viewed_at: Date.now() }, ...prev]
          } else {
            newCache = [
              { ...topic, viewed_at: Date.now() },
              ...prev.slice(0, index),
              ...prev.slice(index + 1)
            ]
          }
          return mappedToV2(newCache)
        })
      }
    }
  }, [state, setState])

  return (
    <ViewedTopicsContext.Provider value={service}>
      {props.children}
    </ViewedTopicsContext.Provider>
  )
}

export const useViewedTopics = () => useContext(ViewedTopicsContext)
