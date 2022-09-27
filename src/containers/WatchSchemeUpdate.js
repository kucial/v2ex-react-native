import { useEffect } from 'react'
import { useColorScheme as useTailwindScheme } from 'tailwindcss-react-native'

import { useColorScheme } from '@/hooks'

export default function WatchSchemeUpdate() {
  const tailwind = useTailwindScheme()
  const scheme = useColorScheme()
  useEffect(() => {
    if (tailwind.colorScheme !== scheme) {
      tailwind.setColorScheme(scheme)
    }
  }, [scheme, tailwind.colorScheme])
  return null
}
