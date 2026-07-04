import { useContext, useEffect, useMemo, useState } from 'react'
import { Image as RNImage, Pressable, View } from 'react-native'
import { PhotoIcon } from 'react-native-heroicons/solid'
import {
  CustomBlockRenderer,
  useInternalRenderer,
} from 'react-native-render-html'
import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'

import {
  openImageViewer,
  useGlobalImageViewing,
} from '@/containers/ImageViewingService'
import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'

import { RenderContext } from './context'

async function loadImage(
  uri: string,
): Promise<{ uri: string; width: number; height: number }> {
  if (
    uri.startsWith(
      'https://api.producthunt.com/widgets/embed-image/v1/featured.svg',
    )
  ) {
    return Promise.resolve({
      uri,
      width: 250,
      height: 54,
    })
  }
  return new Promise((resolve, reject) => {
    RNImage.getSize(
      uri,
      (width, height) => {
        resolve({
          uri: uri,
          width: width,
          height: height,
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

  const [containerWidth, setContainerWidth] = useState(null)

  // Use the global store directly — no per-HtmlRender Provider needed.
  const { addImage, updateImage, removeImage } = useGlobalImageViewing()
  const { handleQrCode, imageOrigins } = useContext(RenderContext)
  const { theme } = useTheme()

  const uri = rendererProps.source.uri

  // Register this image in the global registry on mount; clean up on unmount.
  useEffect(() => {
    // Track insertion order so the viewer carousel is ordered correctly.
    imageOrigins.current = [
      ...imageOrigins.current.filter((u) => u !== uri),
      uri,
    ]
    addImage({ origin: uri, local: imageQuery.data?.uri })
    return () => {
      removeImage(uri)
      imageOrigins.current = imageOrigins.current.filter((u) => u !== uri)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri])

  // Update the local-file URL once the image finishes downloading.
  useEffect(() => {
    if (imageQuery.data?.uri) {
      updateImage({ origin: uri, local: imageQuery.data.uri })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uri, imageQuery.data?.uri])

  const contentWidth = rendererProps.contentWidth || 320
  const imageStyle = useMemo(() => {
    if (imageQuery.data) {
      const width = Math.min(
        imageQuery.data.width,
        contentWidth,
        containerWidth,
      )
      const height = (imageQuery.data.height / imageQuery.data.width) * width
      return { width, height }
    } else {
      const width = contentWidth
      return { width, height: width * 0.66667 }
    }
  }, [imageQuery.data, contentWidth, containerWidth])

  if (!containerWidth) {
    return (
      <View
        className='w-full'
        onLayout={(e) => {
          setContainerWidth(e.nativeEvent.layout.width)
        }}
      ></View>
    )
  }

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
          openImageViewer(uri, imageOrigins.current, handleQrCode)
        }}
      >
        <Image
          style={[imageStyle, { borderRadius: 4 }]}
          source={imageQuery.data}
        />
      </Pressable>
    )
  }

  return (
    <Pressable
      className='py-1 w-full overflow-hidden'
      onPress={() => {
        openImageViewer(uri, imageOrigins.current, handleQrCode)
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
