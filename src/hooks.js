import { useCallback, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { getScreenInfo } from './utils/url'
import { getJSON, setJSON } from './utils/storage'
import { useEffect } from 'react'

export const useAppLinkHandler = () => {
  const navigation = useNavigation()
  return useCallback((href) => {
    const screen = getScreenInfo(href)
    if (screen) {
      navigation.push(screen.name, screen.params)
    }
  }, [])
}

// https://stackoverflow.com/questions/54954091/how-to-use-callback-with-usestate-hook-in-react
function useStateCallback(initialState) {
  const [state, setState] = useState(initialState)
  const cbRef = useRef(null) // init mutable ref container for callbacks

  const setStateCallback = useCallback((state, cb) => {
    cbRef.current = cb // store current, passed callback in ref
    setState(state)
  }, []) // keep object reference stable, exactly like `useState`

  useEffect(() => {
    // cb.current is `null` on initial render,
    // so we only invoke callback on state *updates*
    if (cbRef.current) {
      cbRef.current(state)
      cbRef.current = null // reset callback after execution
    }
  }, [state])

  return [state, setStateCallback]
}

export const useCachedState = (cacheKey, initialState = null) => {
  const [state, setState] = useStateCallback(() => {
    return getJSON(cacheKey, initialState)
  })

  const setStateThenCache = useCallback(
    (updater) => {
      setState(updater, (updated) => setJSON(cacheKey, updated))
    },
    [cacheKey]
  )
  return [state, setStateThenCache]
}
