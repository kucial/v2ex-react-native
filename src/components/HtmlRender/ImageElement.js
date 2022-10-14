import React, { useCallback, useEffect } from 'react'
import FastImage from 'react-native-fast-image'
import {
  IMGElementContainer,
  IMGElementContentError,
  IMGElementContentLoading,
  useIMGElementState,
  useIMGElementStateWithCache
} from 'react-native-render-html'

import {
  useCachedImageDimensions,
  useImageDimensionCache
} from './ImageDimensionCache'
import { useImageViewing } from './ImageViewingService'

const IMGElementContentSuccess = ({
  source,
  imageStyle,
  dimensions,
  onError
}) => {
  const cache = useImageDimensionCache()
  const onImageError = useCallback(
    ({ nativeEvent: { error } }) => onError(error),
    [onError]
  )
  const onLoad = useCallback((e) => {
    cache.update(source.uri, {
      width: e.nativeEvent.width,
      height: e.nativeEvent.height
    })
  }, [])

  return (
    <FastImage
      source={source}
      style={[dimensions, imageStyle]}
      testID="image-success"
      onError={onImageError}
      onLoad={onLoad}
    />
  )
}

const DefaultImage = (props) => {
  const state = useIMGElementState(props)
  let content = React.createElement(IMGElementContentSuccess, state)

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
  let content = React.createElement(IMGElementContentSuccess, state)

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

export default function ImageElement(props) {
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
