/**
 * 缓存优先的图片组件
 * 1. 如果存在缓存则使用缓存
 * 2. 过渡渐进效果
 */
import 'react-native-url-polyfill/auto'

import { useEffect, useMemo, useState } from 'react'
import {
  Animated,
  ColorValue,
  Image,
  ImageBackground as ImageBackgroundBase,
  ImageBackgroundProps,
  ImageStyle,
  ImageURISource,
  View,
} from 'react-native'
import { styled } from 'nativewind'

import { useTheme } from '@/containers/ThemeService'
import { downloadImage } from '@/utils/image'

type ImageCacheInfo = {
  cached: boolean
  error?: Error
  uri?: string
}

const cachedMap: Record<string, string> = {}
export const useImageCache = (source: ImageURISource) => {
  const [info, setInfo] = useState<ImageCacheInfo>(() => ({
    cached: !!cachedMap[source.uri],
    uri: cachedMap[source.uri],
  }))

  useEffect(() => {
    if (info.cached) {
      return
    }
    downloadImage(source.uri)
      .then((fileUri) => {
        setInfo({
          cached: true,
          uri: fileUri,
        })
        cachedMap[source.uri] = fileUri
      })
      .catch((err) => {
        setInfo({
          cached: false,
          uri: source.uri,
          error: err,
        })
      })
  }, [source.uri])

  return info
}

export const AnimatedImage = styled(
  (props: {
    source: ImageURISource
    style?: ImageStyle
    skeletonColor?: ColorValue
  }) => {
    const [previousImage, setPreviousImage] = useState('')
    const cachedImage = useImageCache(props.source)
    const { theme } = useTheme()

    const opacity = useMemo(() => new Animated.Value(0), [])

    useEffect(() => {
      if (cachedImage.uri) {
        Animated.timing(opacity, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }).start(() => {
          setPreviousImage(cachedImage.uri)
          setTimeout(() => {
            opacity.setValue(0)
          })
        })
      }
    }, [cachedImage.uri])

    return (
      <View
        style={[
          {
            backgroundColor: props.skeletonColor ?? theme.colors.skeleton,
            overflow: 'hidden',
          },
          props.style,
        ]}>
        {previousImage && (
          <Image
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            source={{ uri: previousImage }}
          />
        )}
        <Animated.Image
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            opacity,
          }}
          source={{
            uri: cachedImage.uri,
          }}
        />
      </View>
    )
  },
)

export const ImageBackground = (
  props: Omit<ImageBackgroundProps, 'source'> & {
    source: ImageURISource
  },
) => {
  const cache = useImageCache(props.source)
  return <ImageBackgroundBase {...props} source={{ uri: cache.uri }} />
}
