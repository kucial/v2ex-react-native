import { useContext } from 'react'
import { Platform, Text } from 'react-native'
import {
  CustomTextualRenderer,
  getNativePropsForTNode,
} from 'react-native-render-html'
import { SelectableText } from '@alentoma/react-native-selectable-text'
import Color from 'color'

import { useTheme } from '@/containers/ThemeService'

import { RenderContext, SelectableTextAncestor } from './context'

const SelectableTextRender: CustomTextualRenderer =
  function SelectableTextRender(props) {
    const renderProps = getNativePropsForTNode(props)
    const { handleUrlPress, handleSelection, menuItems } =
      useContext(RenderContext)
    const hasSelectableTextAncestor = useContext(SelectableTextAncestor)
    const { theme } = useTheme()

    if (hasSelectableTextAncestor) {
      return <Text {...renderProps} />
    }

    return (
      <SelectableTextAncestor.Provider value={true}>
        <SelectableText
          selectable
          selectionColor={Platform.select({
            ios: theme.colors.primary,
            android: Color(theme.colors.primary).alpha(0.5).toString(),
          })}
          value={renderProps.children}
          style={[
            renderProps.style,
            {
              paddingVertical: 12,
              marginVertical: -8,
              // backgroundColor: 'orange',
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

export default SelectableTextRender
