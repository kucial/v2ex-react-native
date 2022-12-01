import { useEffect } from 'react'
import { Text } from 'react-native'
import {
  getNativePropsForTNode,
  useNormalizedUrl,
} from 'react-native-render-html'

import { getImgurResourceImageLink, isImgurResourceLink } from '@/utils/url'

import { useImageViewing } from './ImageViewingService'

export default function AnchorRenderer(props) {
  const renderProps = getNativePropsForTNode(props)
  const url = useNormalizedUrl(props.tnode.attributes.href)
  const service = useImageViewing()
  useEffect(() => {
    if (isImgurResourceLink(url)) {
      const imageUri = getImgurResourceImageLink(url)
      service.add(imageUri)
      return () => {
        service.remove(imageUri)
      }
    }
  }, [url])

  return (
    <Text
      {...renderProps}
      url={url}
      onStartShouldSetResponder
      // onPress={onPress}
    />
  )
}
