import { useContext, useEffect } from 'react'
import { StyleProp, Text, TextStyle } from 'react-native'
import {
  CustomTextualRenderer,
  getNativePropsForTNode,
  useNormalizedUrl,
} from 'react-native-render-html'

import {
  openImageViewer,
  useGlobalImageViewing,
} from '@/containers/ImageViewingService'
import {
  getImgurResourceImageLink,
  isImgurResourceLink,
  tailingFix,
} from '@/utils/url'

import { RenderContext } from './context'

const AnchorRenderer: CustomTextualRenderer = function AnchorRenderer(props) {
  const renderProps = getNativePropsForTNode(
    props as Parameters<typeof getNativePropsForTNode>[0],
  )
  const url = tailingFix(useNormalizedUrl(props.tnode.attributes.href))
  const { handleUrlPress, handleQrCode, imageOrigins } =
    useContext(RenderContext)
  const { addImage, removeImage } = useGlobalImageViewing()

  const hasImageChild = props.tnode.children?.some(
    (child) => child.tagName === 'img',
  )

  // Register imgur resource links in the global image registry so they appear
  // in the carousel alongside inline <img> tags.
  useEffect(() => {
    if (isImgurResourceLink(url)) {
      const imageUri = getImgurResourceImageLink(url)
      imageOrigins.current = [
        ...imageOrigins.current.filter((u) => u !== imageUri),
        imageUri,
      ]
      addImage({ origin: imageUri })
      return () => {
        removeImage(imageUri)
        imageOrigins.current = imageOrigins.current.filter(
          (u) => u !== imageUri,
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  if (hasImageChild) {
    const { TNodeChildrenRenderer } = props
    return <TNodeChildrenRenderer tnode={props.tnode} />
  }

  return (
    <Text
      style={renderProps.style as StyleProp<TextStyle>}
      onPress={() => {
        if (isImgurResourceLink(url)) {
          const imageUri = getImgurResourceImageLink(url)
          openImageViewer(imageUri, imageOrigins.current, handleQrCode)
          return
        }
        handleUrlPress({ interaction: 'default', url })
      }}
      suppressHighlighting
    >
      {renderProps.children}
    </Text>
  )
}

export default AnchorRenderer
