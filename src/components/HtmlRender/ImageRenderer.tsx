import { useContext, useEffect, useMemo, useState } from 'react'
import {
  Image as RNImage,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  CustomBlockRenderer,
  useInternalRenderer,
} from 'react-native-render-html'
import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'

import V2exIcon from '@/components/icons/V2exIcon'

import {
  openImageViewer,
  useGlobalImageViewing,
} from '@/containers/ImageViewingService'
import { useTheme } from '@/containers/ThemeService'
import {
  getEmojiTextFromImgurUrl,
  getTrueEmojiFromImgurUrl,
  isKnownImgurEmoji,
} from '@/utils/emojis'

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
    } else if (isKnownImgurEmoji(uri)) {
      return { width: 36, height: 36 }
    } else {
      const width = contentWidth
      return { width, height: width * 0.66667 }
    }
  }, [imageQuery.data, contentWidth, containerWidth, uri])

  const isSticker = useMemo(() => {
    if (
      uri.includes('/sticker/') ||
      uri.includes('/emoji/') ||
      uri.includes('/emoticon/') ||
      uri.includes('/smilies/') ||
      uri.includes('twemoji') ||
      isKnownImgurEmoji(uri)
    ) {
      return true
    }
    if (imageQuery.data) {
      return imageQuery.data.width <= 140 && imageQuery.data.height <= 140
    }
    const attrW = Number(props.tnode?.attributes?.width)
    const attrH = Number(props.tnode?.attributes?.height)
    if (!isNaN(attrW) && !isNaN(attrH) && attrW <= 140 && attrH <= 140) {
      return true
    }
    return false
  }, [uri, imageQuery.data, props.tnode?.attributes])

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
        style={
          isSticker ? imgStyles.stickerPressable : imgStyles.loadedPressable
        }
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
      style={
        isSticker ? imgStyles.stickerPressable : imgStyles.loadingPressable
      }
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
          isKnownImgurEmoji(uri) ? (
            <Text
              style={[
                imgStyles.fallbackEmojiText,
                { color: theme.colors.text },
              ]}
            >
              {getTrueEmojiFromImgurUrl(uri) || getEmojiTextFromImgurUrl(uri)}
            </Text>
          ) : (
            <V2exIcon
              name='photo-solid'
              size={36}
              color={
                typeof theme.colors.danger === 'string'
                  ? theme.colors.danger
                  : undefined
              }
            />
          )
        ) : (
          <V2exIcon
            name='photo-solid'
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
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
  },
  stickerPressable: {
    paddingVertical: 4,
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  loadingPressable: {
    paddingVertical: 4,
    width: '100%',
    alignItems: 'center',
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
  fallbackEmojiText: {
    fontSize: 13,
    fontWeight: '500',
  },
})

export default ImageRenderer
