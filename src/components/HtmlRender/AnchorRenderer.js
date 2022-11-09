import { Text } from 'react-native'
import {
  getNativePropsForTNode,
  useNormalizedUrl
} from 'react-native-render-html'
import { useAElementProps } from 'react-native-render-html/src/renderers/ARenderer'

export default function AnchorRenderer(props) {
  const renderProps = getNativePropsForTNode(props)
  const url = useNormalizedUrl(props.tnode.attributes.href)
  const { onPress } = useAElementProps(props)

  return (
    <Text
      {...renderProps}
      url={url}
      onStartShouldSetResponder
      // onPress={onPress}
    />
  )
}
