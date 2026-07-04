import { useContext, useEffect, useMemo, useState } from 'react'
import { Image as RNImage, Pressable, StyleSheet, View } from 'react-native'
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
  const uri = rendererProps.source.uri ?? ''
  const imageQuery = useQuery({
    queryKey: ['image-cache', uri],
    queryFn: () => loadImage(uri),
    enabled: !!uri,
    refetchOnMount: 'always',
  })

  const [containerWidth, setContainerWidth] = useState<number | null>(null)

  // Use the global store directly — no per-HtmlRender Provider needed.
  const { addImage, updateImage, removeImage } = useGlobalImageViewing()
  const { handleQrCode, imageOrigins } = useContext(RenderContext)
  const { theme } = useTheme()

  // Register this image in the global registry on mount; clean up on unmount.
  useEffect(() => {
    if (!uri) {
      return
    }
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
    if (uri && imageQuery.data?.uri) {
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
        containerWidth ?? contentWidth,
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
        style={imgStyles.wFull}
        onLayout={(e) => {
          setContainerWidth(e.nativeEvent.layout.width)
        }}
      ></View>
    )
  }

  if (imageQuery.data) {
    return (
      <Pressable
        style={[imgStyles.loadedPressable, { width: imageStyle.width }]}
        onPress={() => {
          openImageViewer(uri, imageOrigins.current, handleQrCode)
        }}
      >
        <Image
          style={[imageStyle, imgStyles.rounded]}
          source={imageQuery.data}
        />
      </Pressable>
    )
  }

  return (
    <Pressable
      style={imgStyles.loadingPressable}
      onPress={() => {
        openImageViewer(uri, imageOrigins.current, handleQrCode)
      }}
    >
      <View
        style={[
          imageStyle,
          imgStyles.skeletonBox,
          { backgroundColor: theme.colors.skeleton },
        ]}
      >
        {imageQuery.error ? (
          <PhotoIcon
            size={36}
            color={
              typeof theme.colors.danger === 'string'
                ? theme.colors.danger
                : undefined
            }
          />
        ) : (
          <PhotoIcon
            size={36}
            color={
              typeof theme.colors.text_meta === 'string'
                ? theme.colors.text_meta
                : undefined
            }
          />
        )}
      </View>
    </Pressable>
  )
}

const imgStyles = StyleSheet.create({
  wFull: {
    width: '100%',
  },
  loadedPressable: {
    paddingVertical: 4,
    alignItems: 'center',
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  loadingPressable: {
    paddingVertical: 4,
    width: '100%',
    overflow: 'hidden',
  },
  rounded: {
    borderRadius: 4,
  },
  skeletonBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
})

export default ImageRenderer
