import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Image, Pressable, View } from 'react-native'
import { PhotoIcon } from 'react-native-heroicons/solid'
import {
  CustomBlockRenderer,
  useInternalRenderer,
} from 'react-native-render-html'
import { useQuery } from '@tanstack/react-query'

import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'
import { downloadImage } from '@/utils/image'

import { useImageViewing } from './ImageViewingService'

async function loadImage(
  uri: string,
): Promise<{ uri: string; width: number; height: number }> {
  const fileUri = await downloadImage(uri)
  return new Promise((resolve, reject) => {
    Image.getSize(
      fileUri,
      (width, height) => {
        resolve({
          uri: fileUri,
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
  const [containerWidth, setContainerWidth] = useState(Infinity)
  const containerWidthRef = useRef(0)

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
      const width = Math.min(
        imageQuery.data.width,
        containerWidth,
        contentWidth,
      )
      const height = (imageQuery.data.height / imageQuery.data.width) * width
      return {
        width,
        height,
      }
    } else {
      const width = Math.min(containerWidth, contentWidth)
      return {
        width: width,
        height: width * 0.66667,
      }
    }
  }, [imageQuery.data, contentWidth, containerWidth])

  const handleContainerLayout = useCallback((event) => {
    const { width } = event.nativeEvent.layout
    if (width === containerWidthRef.current) {
      return
    }
    containerWidthRef.current = width
    setContainerWidth(width)
  }, [])

  if (imageQuery.data) {
    return (
      <Pressable
        className={cn(
          'py-1 active:opacity-50 w-full items-center overflow-hidden',
          containerWidth === Infinity ? 'opacity-0' : 'opacity-100',
        )}
        onPress={() => {
          service.open(rendererProps.source.uri)
        }}
        onLayout={handleContainerLayout}
      >
        <Image
          style={[
            imageStyle,
            {
              borderRadius: 4,
            },
          ]}
          source={{
            uri: imageQuery.data.uri,
          }}
        />
      </Pressable>
    )
  }

  return (
    <Pressable
      className='py-1 active:opacity-50 w-full overflow-hidden'
      onPress={() => {
        service.open(rendererProps.source.uri)
      }}
      onLayout={handleContainerLayout}
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
