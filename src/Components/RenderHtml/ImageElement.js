import {
  useIMGElementState,
  IMGElementContentError,
  IMGElementContentLoading,
  IMGElementContainer
} from 'react-native-render-html'
import { Image } from 'react-native'
import React, { useCallback } from 'react'
import ImageModal from 'react-native-image-modal'

const IMGElementContentSuccess = ({
  source,
  imageStyle,
  dimensions,
  onError
}) => {
  const onImageError = useCallback(
    ({ nativeEvent: { error } }) => onError(error),
    [onError]
  )

  return (
    <>
      <Image
        source={source}
        onError={onImageError}
        style={[dimensions, imageStyle, { display: 'none' }]}
        testID="image-success"
      />
      <ImageModal
        resizeMode="contain"
        style={[dimensions, imageStyle]}
        source={source}
      />
    </>
  )
}

export default function ImageElement(props) {
  const state = useIMGElementState(props)
  let content
  if (state.type === 'success') {
    content = React.createElement(IMGElementContentSuccess, state)
  } else if (state.type === 'loading') {
    content = React.createElement(IMGElementContentLoading, state)
  } else {
    content = React.createElement(IMGElementContentError, state)
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
