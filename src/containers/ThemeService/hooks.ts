import { useEffect, useRef, useState } from 'react'
import { Appearance, AppState, AppStateStatus } from 'react-native'

export const useColorScheme = () => {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
  const colorSchemeRef = useRef(colorScheme)
  colorSchemeRef.current = colorScheme

  useEffect(() => {
    function handleColorSchemeChange(nextAppState?: AppStateStatus) {
      const isActive = nextAppState
        ? nextAppState === 'active'
        : AppState.currentState === 'active'

      if (!isActive) return

      const systemColorScheme = Appearance.getColorScheme()
      if (colorSchemeRef.current !== systemColorScheme) {
        if (__DEV__) {
          console.log(
            `change color scheme from ${colorSchemeRef.current} to ${systemColorScheme}`,
          )
        }
        setColorScheme(systemColorScheme)
        colorSchemeRef.current = systemColorScheme
      }
    }

    const subscriptionA = AppState.addEventListener('change', handleColorSchemeChange)
    const subscriptionB = Appearance.addChangeListener(() => handleColorSchemeChange())

    return () => {
      subscriptionA.remove()
      subscriptionB.remove()
    }
  }, [])

  return {
    colorScheme,
    setColorScheme,
  }
}
