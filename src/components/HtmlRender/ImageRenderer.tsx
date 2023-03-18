import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Image, Pressable } from 'react-native'
import { PhotoIcon } from 'react-native-heroicons/solid'
import {
  CustomBlockRenderer,
  useInternalRenderer,
} from 'react-native-render-html'
import classNames from 'classnames'
import useSWR from 'swr'

import { useTheme } from '@/containers/ThemeService'
import { downloadImage } from '@/utils/image'

import { Box } from '../Skeleton/Elements'
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
  const imageSwr = useSWR(rendererProps.source.uri, loadImage, {
    revalidateOnMount: true,
  })
  const [containerWidth, setContainerWidth] = useState(Infinity)
  const containerWidthRef = useRef(0)

  const service = useImageViewing()
  const { theme } = useTheme()
  useEffect(() => {
    service.add({
      origin: rendererProps.source.uri,
      local: imageSwr.data?.uri,
    })
    return () => {
      service.remove(rendererProps.source.uri)
    }
  }, [rendererProps.source.uri])

  useEffect(() => {
    service.update({
      origin: rendererProps.source.uri,
      local: imageSwr.data?.uri,
    })
  }, [imageSwr.data?.uri, rendererProps.source.uri])

  const contentWidth = rendererProps.contentWidth || 320
  const imageStyle = useMemo(() => {
    if (imageSwr.data) {
      const width = Math.min(imageSwr.data.width, containerWidth, contentWidth)
      const height = (imageSwr.data.height / imageSwr.data.width) * width
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
  }, [imageSwr.data, contentWidth, containerWidth])

  const handleContainerLayout = useCallback((event) => {
    const { width } = event.nativeEvent.layout
    if (width === containerWidthRef.current) {
      return
    }
    containerWidthRef.current = width
    setContainerWidth(width)
  }, [])

  if (imageSwr.data) {
    return (
      <Pressable
        className={classNames(
          'py-1 active:opacity-50 w-full items-center overflow-hidden',
          containerWidth === Infinity ? 'opacity-0' : 'opacity-100',
        )}
        onPress={() => {
          service.open(rendererProps.source.uri)
        }}
        onLayout={handleContainerLayout}>
        <Image
          style={[
            imageStyle,
            {
              borderRadius: 4,
            },
          ]}
          source={{
            uri: imageSwr.data.uri,
          }}
        />
      </Pressable>
    )
  }

  return (
    <Pressable
      className="py-1 active:opacity-50 w-full overflow-hidden"
      onPress={() => {
        service.open(rendererProps.source.uri)
      }}
      onLayout={handleContainerLayout}>
      <Box
        style={[
          imageStyle,
          {
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
          },
        ]}>
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
