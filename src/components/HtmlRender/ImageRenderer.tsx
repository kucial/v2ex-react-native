import { useEffect, useMemo } from 'react'
import { Image as RNImage, Pressable, View } from 'react-native'
import { PhotoIcon } from 'react-native-heroicons/solid'
import {
  CustomBlockRenderer,
  useInternalRenderer,
} from 'react-native-render-html'
import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'

import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'

import { useImageViewing } from './ImageViewingService'

async function loadImage(
  uri: string,
): Promise<{ uri: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    RNImage.getSize(
      uri,
      (width, height) => {
        resolve({
          uri: uri,
          width,
          height,
        })
      },
      reject,
    )
  })
}

const ImageRenderer: CustomBlockRenderer = function ImageRenderer(props) {
  const { rendererProps } = useInternalRenderer<'img'>('img', props)
  const imageQuery = useQuery({
    queryKey: ['image-cache', rendererProps.source.uri],
    queryFn: () => loadImage(rendererProps.source.uri),
    refetchOnMount: 'always',
  })

  const service = useImageViewing()
  const { theme } = useTheme()
  useEffect(() => {
    service.add({
      origin: rendererProps.source.uri,
      local: imageQuery.data?.uri,
    })
    return () => {
      service.remove(rendererProps.source.uri)
    }
  }, [rendererProps.source.uri])

  useEffect(() => {
    service.update({
      origin: rendererProps.source.uri,
      local: imageQuery.data?.uri,
    })
  }, [imageQuery.data?.uri, rendererProps.source.uri])

  const contentWidth = rendererProps.contentWidth || 320
  const imageStyle = useMemo(() => {
    if (imageQuery.data) {
      const width = Math.min(imageQuery.data.width, contentWidth)
      const height = (imageQuery.data.height / imageQuery.data.width) * width
      return {
        width,
        height,
      }
    } else {
      const width = contentWidth
      return {
        width: width,
        height: width * 0.66667,
      }
    }
  }, [imageQuery.data, contentWidth])

  if (imageQuery.data) {
    return (
      <Pressable
        className={cn(
          'py-1 w-full items-center overflow-hidden',
          'opacity-100',
        )}
        style={{
          width: imageStyle.width,
          alignSelf: 'flex-start',
        }}
        onPress={() => {
          service.open(rendererProps.source.uri)
        }}
      >
        <Image
          style={[
            imageStyle,
            {
              borderRadius: 4,
            },
          ]}
          source={imageQuery.data}
        />
      </Pressable>
    )
  }

  return (
    <Pressable
      className='py-1 w-full overflow-hidden'
      onPress={() => {
        service.open(rendererProps.source.uri)
      }}
    >
      <View
        style={[
          imageStyle,
          {
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            backgroundColor: theme.colors.skeleton,
          },
        ]}
        className={imageQuery.error ? '' : 'animate-pulse'}
      >
        {imageQuery.error ? (
          <PhotoIcon size={36} color={theme.colors.danger} />
        ) : (
          <PhotoIcon size={36} color={theme.colors.text_meta} />
        )}
      </View>
    </Pressable>
  )
}

export default ImageRenderer
