import { Image } from 'react-native'

import { useTheme } from '@/containers/ThemeService'
import { staticAsset } from '@/utils/assets'
export default function AppBrandIcon(props: { width?: number }) {
  const { colorScheme } = useTheme()
  const { width = 120 } = props
  return (
    <Image
      source={{
        uri:
          colorScheme === 'light'
            ? staticAsset('brand-default.png')
            : staticAsset('brand-inverse.png'),
      }}
      style={{ width, height: (width * 819) / 1085 }}
    />
  )
}
