import React, { useCallback, useState } from 'react'
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'
import YoutubePlayer from 'react-native-youtube-iframe'
import { HTMLIframe, useHtmlIframeProps } from '@native-html/iframe-plugin'

import { getYoutubeVideoId } from '@/utils/url'

function getNumericStyleValue(
  style: StyleProp<ViewStyle>,
  key: keyof ViewStyle,
) {
  const flattened = StyleSheet.flatten(style)
  const value = flattened?.[key]
  return typeof value === 'number' ? value : null
}

export default function IframeRenderer(
  props: Parameters<typeof useHtmlIframeProps>[0],
) {
  const iframeProps = useHtmlIframeProps(props)
  const { source } = iframeProps
  const [layoutWidth, setLayoutWidth] = useState<number | null>(null)
  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const nextWidth = event.nativeEvent.layout.width
      if (nextWidth && nextWidth !== layoutWidth) {
        setLayoutWidth(nextWidth)
      }
    },
    [layoutWidth],
  )
  if (source?.uri) {
    const videoId = getYoutubeVideoId(source.uri)
    console.log('videoId', videoId)
    if (videoId) {
      const width =
        layoutWidth ?? getNumericStyleValue(iframeProps.style, 'width')
      const height = width ? (width * 9) / 16 : 200
      return (
        <View onLayout={handleLayout}>
          <YoutubePlayer
            height={height}
            width={width ?? undefined}
            videoId={videoId}
            play={false}
          />
        </View>
      )
    }
  }
  return React.createElement(HTMLIframe, iframeProps)
}
