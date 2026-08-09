import { useCallback, useMemo } from 'react'
import { uniqBy } from 'lodash'

import { useCachedState } from '@/utils/hooks'
import { getJSON } from '@/utils/storage'

import { CACHE_KEY, HISTORY_CACHE_KEY } from './constants'
import { SearchHistoryService, SearchParams } from './types'

export const useSearchHistory = () => {
  const [history, setHistory] = useCachedState<SearchParams[]>(
    HISTORY_CACHE_KEY,
    [],
    (initialState) => {
      if (initialState) {
        return initialState
      }
      const cache = getJSON(CACHE_KEY)
      if (cache) {
        return [cache] as SearchParams[]
      }
      return [] as SearchParams[]
    },
  )

  const addRecord = useCallback(
    (param: SearchParams) => {
      setHistory((prev) => uniqBy([param, ...prev], 'q').slice(0, 15))
    },
    [setHistory],
  )
  const clear = useCallback(() => {
    setHistory([])
  }, [setHistory])

  return useMemo<SearchHistoryService>(
    () => ({ records: history, addRecord, clear }),
    [history, addRecord, clear],
  )
}
