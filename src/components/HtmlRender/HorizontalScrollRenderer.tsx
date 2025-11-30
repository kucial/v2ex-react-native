import { ScrollView } from 'react-native'
import {
  CustomBlockRenderer,
  getNativePropsForTNode,
} from 'react-native-render-html'

const HorizontalScrollRenderer: CustomBlockRenderer = function ScrollRenderer(
  props,
) {
  const renderProps = getNativePropsForTNode(props)
  // TODO: render it in webview.
  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      style={renderProps.style}
      contentContainerClassName='px-2'
    >
      {renderProps.children}
    </ScrollView>
  )
}

export default HorizontalScrollRenderer
