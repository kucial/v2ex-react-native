import { createContext, useState, useMemo, useContext } from 'react'
import { getJSON, setJSON } from '@/utils/storage'

const CACHE_KEY = '$app$/viewed-topics'

export const ViewedTopicsContext = createContext({
  hasViewed: () => false,
  touchViewed: () => undefined
})

export default function ViewedTopicsService(props) {
  const [state, setState] = useState(getJSON(CACHE_KEY, []))

  const service = useMemo(() => {
    return {
      items: state,
      hasViewed: (id) => state.some((t) => String(t.id) === String(id)),
      touchViewed: (topic) => {
        setState((prev) => {
          const index = prev.findIndex((t) => String(t.id) === String(topic.id))
          const newCache = [
            { ...topic, viewed_at: Date.now() },
            ...prev.slice(0, index),
            ...prev.slice(index + 1)
          ]
          setJSON(CACHE_KEY, newCache)
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
