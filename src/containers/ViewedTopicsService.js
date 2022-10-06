import { createContext, useContext, useMemo, useState } from 'react'

import { useCachedState } from '@/hooks'

const CACHE_KEY = '$app$/viewed-topics'

export const ViewedTopicsContext = createContext({
  hasViewed: () => false,
  touchViewed: () => undefined
})

export default function ViewedTopicsService(props) {
  const [state, setState] = useCachedState(CACHE_KEY, [])

  const service = useMemo(() => {
    return {
      items: state,
      hasViewed: (id) => state.some((t) => String(t.id) === String(id)),
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
          return newCache
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
