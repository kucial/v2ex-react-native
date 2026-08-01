import { SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import * as Sentry from '@sentry/react-native'
import { debounce } from 'lodash'

import { track } from '@/lib/tracking'

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
    if (cacheRef.current !== state && state !== undefined) {
      updateCache(state)
    }
  }, [state])

  return [state, updateState]
}
type PressBreadCrumbConfig = {
  /** Where the control lives, e.g. `AppSidebar`. */
  component: string
  /** What it does, e.g. `search`. Must be a stable identifier, not prose. */
  action: string
}

/**
 * Wrap a press handler so it records a `ui.press` analytics event and a Sentry
 * breadcrumb (the latter is crash context, and is only uploaded with an error).
 *
 * `component`/`action` are deliberately structured rather than a free-form
 * message — the values leave the device.
 */
export const usePressBreadcrumb = (
  func: (...args: any[]) => void,
  config: PressBreadCrumbConfig,
) => {
  const { component, action } = config
  return useCallback(
    (...args: any[]) => {
      track('ui.press', { component, action })
      Sentry.addBreadcrumb({
        type: 'info',
        category: 'ui.press',
        message: `${component}.${action}`,
      })
      func(...args)
    },
    [func, component, action],
  )
}
