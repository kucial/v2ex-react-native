import { useEffect } from 'react'
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
    return (
      <Renderer
        {...rendererProps}
        style={[rendererProps.style, { marginTop: 4, borderRadius: 4 }]}
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
    <Box
      style={{
        width: contentWidth,
        height: contentWidth * 0.66667,
        marginTop: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
      }}>
      <PhotoIcon size={36} color={theme.colors.text_meta} />
    </Box>
  )
}

export default ImageRenderer
