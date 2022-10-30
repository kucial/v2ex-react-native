import { useCallback, useEffect, useRef, useState } from 'react'
import { Appearance } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { debounce, throttle } from 'lodash'

import { getJSON, setJSON } from './utils/storage'
import { getScreenInfo } from './utils/url'

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

export const useCachedState = (cacheKey, initialState = null, revalidate) => {
  const cacheInit = useRef(null)
  const updateCache = useCallback(
    debounce((value) => {
      console.log('update cache', cacheKey)
      setJSON(cacheKey, value)
    }, 600),
    [cacheKey]
  )
  const [state, setState] = useState(() => {
    let cache = getJSON(cacheKey, initialState)
    if (revalidate) {
      cache = revalidate(cache)
    }
    cacheInit.current = cache
    return cache
  })

  useEffect(() => {
    if (cacheInit.current !== state) {
      updateCache(state)
    }
  }, [state])

  return [state, setState]
}

export const useColorScheme = (delay = 250) => {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
  const onColorSchemeChange = useCallback(
    throttle(
      ({ colorScheme }) => {
        setColorScheme(colorScheme)
      },
      delay,
      {
        leading: false
      }
    ),
    []
  )
  useEffect(() => {
    const subscription = Appearance.addChangeListener(onColorSchemeChange)
    return () => {
      onColorSchemeChange.cancel()
      subscription.remove()
    }
  }, [])
  return colorScheme
}
