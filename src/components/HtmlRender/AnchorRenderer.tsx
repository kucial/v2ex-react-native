import { useContext, useEffect } from 'react'
import { Pressable, Text } from 'react-native'
import {
  CustomTextualRenderer,
  getNativePropsForTNode,
  useNormalizedUrl,
} from 'react-native-render-html'

import {
  getImgurResourceImageLink,
  isImgurResourceLink,
  tailingFix,
} from '@/utils/url'

import { RenderContext } from './context'
import { useImageViewing } from '@/containers/ImageViewingService'

const AnchorRenderer: CustomTextualRenderer = function AnchorRenderer(props) {
  const renderProps = getNativePropsForTNode(props)
  const url = tailingFix(useNormalizedUrl(props.tnode.attributes.href))
  const { handleUrlPress } = useContext(RenderContext)
  const service = useImageViewing()
  const hasImageChild = props.tnode.children?.some(
    (child) => child.tagName === 'img',
  )
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

  if (hasImageChild) {
    const { TNodeChildrenRenderer } = props
    return <TNodeChildrenRenderer tnode={props.tnode} />
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
      suppressHighlighting
    />
  )
}

export default AnchorRenderer
