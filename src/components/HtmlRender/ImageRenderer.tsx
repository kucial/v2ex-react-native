import React, { useCallback, useEffect } from 'react'
import FastImage, { OnLoadEvent } from 'react-native-fast-image'
import {
  CustomBlockRenderer,
  IMGElementContainer,
  IMGElementContentError,
  IMGElementProps,
  useIMGElementState,
  useIMGElementStateWithCache,
  useInternalRenderer,
} from 'react-native-render-html'

import {
  useCachedImageDimensions,
  useImageDimensionCache,
} from './ImageDimensionCache'
import { useImageViewing } from './ImageViewingService'

const IMGElementContentSuccess = ({ source, imageStyle, dimensions }) => {
  const cache = useImageDimensionCache()
  const onLoad = useCallback((e: OnLoadEvent) => {
    cache.update(source.uri, {
      width: e.nativeEvent.width,
      height: e.nativeEvent.height,
    })
  }, [])

  return (
    <FastImage
      source={source}
      style={[dimensions, imageStyle]}
      testID="image-success"
      onLoad={onLoad}
    />
  )
}

function ImageRender(props) {
  const { state } = props
  let content
  if (state.type === 'error') {
    content = React.createElement(IMGElementContentError, state)
  } else {
    content = React.createElement(IMGElementContentSuccess, state)
  }

  return (
    <IMGElementContainer
      testID={props.testID}
      {...props.containerProps}
      onPress={props.onPress}
      style={state.containerStyle}>
      {content}
    </IMGElementContainer>
  )
}

const CachedImage = (props) => {
  const state = useIMGElementStateWithCache(props)
  return <ImageRender {...props} state={state} />
}

const DefaultImage = (props) => {
  const state = useIMGElementState(props)
  return <ImageRender {...props} state={state} />
}

function ImageElement(props) {
  const cachedDimensions = useCachedImageDimensions(props.source.uri)
  const service = useImageViewing()
  useEffect(() => {
    const imageUri = props.source.uri
    service.add(imageUri)
    return () => {
      service.remove(imageUri)
    }
  }, [props.source.uri])
  if (cachedDimensions) {
    return (
      <CachedImage
        cachedNaturalDimensions={cachedDimensions}
        {...props}
        onPress={() => {
          service.open(props.source.uri)
        }}
      />
    )
  }
  return (
    <DefaultImage
      {...props}
      onPress={() => {
        service.open(props.source.uri)
      }}
    />
  )
}

const ImageRenderer: CustomBlockRenderer = function ImageRenderer(props) {
  const { rendererProps } = useInternalRenderer<'img'>('img', props)
  // console.log(rendererProps)
  return <ImageElement {...rendererProps} />
}

export default ImageRenderer
