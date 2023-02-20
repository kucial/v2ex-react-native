import { useEffect } from 'react'
import { View } from 'react-native'
import { PhotoIcon } from 'react-native-heroicons/solid'
import {
  CustomBlockRenderer,
  useInternalRenderer,
} from 'react-native-render-html'

import { useTheme } from '@/containers/ThemeService'

import { useImageCache } from '../Image'
import { Box } from '../Skeleton/Elements'
import { useImageViewing } from './ImageViewingService'

const ImageRenderer: CustomBlockRenderer = function ImageRenderer(props) {
  const { Renderer, rendererProps } = useInternalRenderer<'img'>('img', props)
  const cache = useImageCache(rendererProps.source)
  const service = useImageViewing()
  const { theme } = useTheme()
  useEffect(() => {
    if (cache.uri) {
      service.add(cache.uri)
      return () => {
        service.remove(cache.uri)
      }
    } else {
      service.add(rendererProps.source.uri)
      return () => {
        service.remove(rendererProps.source.uri)
      }
    }
  }, [cache.uri])

  const contentWidth = rendererProps.contentWidth || 320

  if (cache.uri) {
    console.log(rendererProps.style)
    return (
      <Renderer
        {...rendererProps}
        style={rendererProps.style}
        source={{
          uri: cache.uri,
        }}
        onPress={() => {
          service.open(cache.uri)
        }}
      />
    )
  }

  return (
    <View style={{ paddingVertical: 4 }}>
      <Box
        style={{
          width: contentWidth,
          height: contentWidth * 0.66667,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <PhotoIcon size={36} color={theme.colors.text_meta} />
      </Box>
    </View>
  )
}

export default ImageRenderer
