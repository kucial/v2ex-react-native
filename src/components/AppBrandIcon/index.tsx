import { Image } from 'expo-image'

import { useTheme } from '@/containers/ThemeService'

export default function AppBrandIcon(props: { width?: number }) {
  const { colorScheme, name } = useTheme()
  const { width = 120 } = props

  return (
    <Image
      source={`brand_${name}_${colorScheme}`}
      style={{ width, height: (width * 880) / 815 }}
    />
  )
}
