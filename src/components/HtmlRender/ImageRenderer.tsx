import { useEffect } from 'react'
import { Pressable, View } from 'react-native'
import { PhotoIcon } from 'react-native-heroicons/solid'
import {
  CustomBlockRenderer,
  useInternalRenderer,
} from 'react-native-render-html'
import useSWR from 'swr'

import { useTheme } from '@/containers/ThemeService'
import { downloadImage } from '@/utils/image'

import { Box } from '../Skeleton/Elements'
import { useImageViewing } from './ImageViewingService'

const ImageRenderer: CustomBlockRenderer = function ImageRenderer(props) {
  const { Renderer, rendererProps } = useInternalRenderer<'img'>('img', props)
  const imageSwr = useSWR(rendererProps.source.uri, downloadImage)
  const service = useImageViewing()
  const { theme } = useTheme()
  useEffect(() => {
    if (imageSwr.data) {
      service.replace(imageSwr.data, rendererProps.source.uri)
      return () => {
        service.remove(imageSwr.data)
      }
    } else {
      service.add(rendererProps.source.uri)
      return () => {
        service.remove(rendererProps.source.uri)
      }
    }
  }, [imageSwr.data, rendererProps.source.uri])

  const contentWidth = rendererProps.contentWidth || 320

  if (imageSwr.data) {
    return (
      <Renderer
        {...rendererProps}
        style={rendererProps.style}
        source={{
          uri: imageSwr.data,
        }}
        onPress={() => {
          service.open(imageSwr.data)
        }}
      />
    )
  }

  return (
    <Pressable
      className="py-1 active:opacity-50"
      onPress={() => {
        service.open(rendererProps.source.uri)
      }}>
      <Box
        style={{
          width: contentWidth,
          height: contentWidth * 0.66667,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {imageSwr.error ? (
          <PhotoIcon size={36} color={theme.colors.danger} />
        ) : (
          <PhotoIcon size={36} color={theme.colors.text_meta} />
        )}
      </Box>
    </Pressable>
  )
}

export default ImageRenderer
