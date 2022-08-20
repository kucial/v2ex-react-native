import { useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
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
