import { SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import * as Sentry from '@sentry/react-native'
import { debounce } from 'lodash'

import { getJSON, setJSON } from './storage'

type CDispatch<A> = (value: A, push?: boolean) => void

export const useCachedState = function useCachedState<
  S extends object | string | number,
>(
  cacheKey: string,
  initialState: S = null,
  revalidate?: (state: any) => S,
): [S, CDispatch<SetStateAction<S>>] {
  const cacheRef = useRef(null)
  const updateCache = useCallback(
    debounce((value) => {
      console.log('update cache', cacheKey)
      cacheRef.current = value
      setJSON(cacheKey, value)
    }, 300),
    [cacheKey],
  )

  const [state, setState] = useState<S>(() => {
    let cache = getJSON(cacheKey, initialState)
    if (revalidate) {
      cache = revalidate(cache)
    }
    cacheRef.current = cache
    return cache
  })

  const updateState: CDispatch<SetStateAction<S>> = useCallback(
    (value: SetStateAction<S>, pushCache = false) => {
      let valueToSet = value
      if (pushCache) {
        if (typeof value === 'function') {
          valueToSet = value(cacheRef.current)
        }
        if (cacheRef.current !== valueToSet) {
          updateCache(valueToSet)
        }
      }
      setState(valueToSet)
    },
    [],
  )

  useEffect(() => {
    if (cacheRef.current !== state) {
      updateCache(state)
    }
  }, [state])

  return [state, updateState]
}
type PressBreadCrumbConfig = {
  message: string
  data?: object
}
export const usePressBreadcrumb = (
  func: (...args: any[]) => void,
  config: PressBreadCrumbConfig,
) => {
  return useCallback(
    (...args: any[]) => {
      Sentry.addBreadcrumb({
        type: 'info',
        category: 'ui.press',
        message: config.message,
        data: config.data,
      })
      func(...args)
    },
    [func],
  )
}
