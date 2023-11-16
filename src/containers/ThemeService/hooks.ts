import { useEffect, useState } from 'react'
import { Appearance, AppState } from 'react-native'

export const useColorScheme = () => {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())

  useEffect(() => {
    function handleColorSchemeChange() {
      const systemColorScheme = Appearance.getColorScheme()
      console.log(systemColorScheme, AppState.currentState)
      if (
        AppState.currentState === 'active' &&
        colorScheme !== systemColorScheme
      ) {
        setColorScheme(systemColorScheme)
      }
    }
    const subscriptionA = AppState.addEventListener(
      'change',
      handleColorSchemeChange,
    )
    const subscriptionB = Appearance.addChangeListener(handleColorSchemeChange)

    return () => {
      subscriptionA.remove()
      subscriptionB.remove()
    }
  }, [colorScheme])

  return {
    colorScheme,
    setColorScheme,
  }
}
