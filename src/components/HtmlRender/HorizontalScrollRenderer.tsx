import { ScrollView } from 'react-native'
import {
  CustomBlockRenderer,
  getNativePropsForTNode,
} from 'react-native-render-html'

const HorizontalScrollRenderer: CustomBlockRenderer = function ScrollRenderer(
  props,
) {
  const renderProps = getNativePropsForTNode(props)
  return (
    <ScrollView horizontal nestedScrollEnabled style={renderProps.style}>
      {renderProps.children}
    </ScrollView>
  )
}

export default HorizontalScrollRenderer
