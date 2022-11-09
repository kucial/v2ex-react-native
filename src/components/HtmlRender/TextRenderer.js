import { useContext } from 'react'
import { Text } from 'react-native'
import { getNativePropsForTNode } from 'react-native-render-html'
import { SelectableText } from '@alentoma/react-native-selectable-text'

import { RenderContext, SelectableTextAncestor } from './context'

// TO_FIX: `a.click` not working if inside SelectableText
export default function SelectableTextRender(props) {
  const renderProps = getNativePropsForTNode(props)
  const { handleUrlPress, handleSelection, menuItems } =
    useContext(RenderContext)
  const hasSelectableTextAncestor = useContext(SelectableTextAncestor)

  if (hasSelectableTextAncestor) {
    return <Text {...renderProps} />
  }
  return (
    <SelectableTextAncestor.Provider value={true}>
      <SelectableText
        selectable
        value={renderProps.children}
        style={[
          renderProps.style,
          {
            paddingVertical: 8,
            marginVertical: -8,
          },
        ]}
        menuItems={menuItems}
        onSelection={handleSelection}
        onPress={renderProps.onPress}
        onUrlPress={handleUrlPress}
      />
    </SelectableTextAncestor.Provider>
  )
}
