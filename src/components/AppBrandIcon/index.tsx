import { Image } from 'expo-image'

import { useTheme } from '@/containers/ThemeService'
export default function AppBrandIcon(props: { width?: number }) {
  const { colorScheme } = useTheme()
  const { width = 120 } = props

  if (colorScheme == 'light') {
    return (
      <Image
        source="brand_default"
        style={{ width, height: (width * 819) / 1085 }}
      />
    )
  }

  return (
    <Image
      source="brand_inverse"
      style={{ width, height: (width * 819) / 1085 }}
    />
  )
}
