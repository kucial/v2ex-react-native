import { useCallback } from 'react'

import { useCachedState } from '@/utils/hooks'

export const useViewedLinks = () => {
  // const getViewedLink
  const [links, setLinks] = useCachedState('$app$/viewed_links', {})

  const getViewedStatus = useCallback(
    (link: string) => {
      return links[link] ? 'viewed' : undefined
    },
    [links],
  )
  const setViewed = useCallback((link) => {
    setLinks((prev) => ({
      ...prev,
      [link]: Date.now(),
    }))
  }, [])
  return {
    getViewedStatus,
    setViewed,
  }
}
