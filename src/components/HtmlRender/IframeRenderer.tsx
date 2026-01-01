import React, { useCallback, useState } from 'react'
import { View } from 'react-native'
import YoutubePlayer from 'react-native-youtube-iframe'
import { HTMLIframe, useHtmlIframeProps } from '@native-html/iframe-plugin'

import { getYoutubeVideoId } from '@/utils/url'

function getNumericStyleValue(style, key) {
  if (!style) return null
  if (Array.isArray(style)) {
    for (let i = style.length - 1; i >= 0; i -= 1) {
      const value = style[i]?.[key]
      if (typeof value === 'number') return value
    }
    return null
  }
  const value = style[key]
  return typeof value === 'number' ? value : null
}

export default function IframeRenderer(props) {
  const iframeProps = useHtmlIframeProps(props)
  const { source } = iframeProps
  const [layoutWidth, setLayoutWidth] = useState<number | null>(null)
  const handleLayout = useCallback(
    (event) => {
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
