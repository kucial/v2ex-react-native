import { useMemo } from 'react'
import { uniqBy } from 'lodash'

import { useCachedState } from '@/utils/hooks'
import { getJSON } from '@/utils/storage'

import { HISTORY_CACHE_KEY } from './constants'
import { CACHE_KEY } from './constants'
import { SearcHistorySerivce, SearchParams } from './types'

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

  return useMemo(
    () =>
      ({
        records: history,
        addRecord(param) {
          // unique by keyword
          setHistory((prev) => {
            return uniqBy([param, ...prev], 'q').slice(0, 15)
          })
        },
        clear() {
          setHistory([])
        },
      } as SearcHistorySerivce),
    [history],
  )
}
