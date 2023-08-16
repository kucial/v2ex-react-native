import { useContext, useEffect } from 'react'
import React from 'react'
import { Platform, Text } from 'react-native'
import {
  CustomTextualRenderer,
  getNativePropsForTNode,
  useNormalizedUrl,
} from 'react-native-render-html'

import { getImgurResourceImageLink, isImgurResourceLink } from '@/utils/url'

import { RenderContext } from './context'
import { useImageViewing } from './ImageViewingService'

const AnchorRenderer: CustomTextualRenderer = function AnchorRenderer(props) {
  const renderProps = getNativePropsForTNode(props)
  const url = useNormalizedUrl(props.tnode.attributes.href)
  const { handleUrlPress } = useContext(RenderContext)
  const service = useImageViewing()
  useEffect(() => {
    if (isImgurResourceLink(url)) {
      const imageUri = getImgurResourceImageLink(url)
      service.add({
        origin: imageUri,
      })
      return () => {
        service.remove(imageUri)
      }
    }
  }, [url])

  if (Platform.OS == 'ios') {
    return <Text {...renderProps} url={url} />
  }

  return (
    <Text
      {...renderProps}
      onPress={() => {
        handleUrlPress({
          interaction: 'default',
          url,
        })
      }}
    />
  )
}

export default AnchorRenderer
