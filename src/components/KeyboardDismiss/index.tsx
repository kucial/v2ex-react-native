import { ReactNode } from 'react'
import {
  Keyboard,
  StyleProp,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native'

import { useEditor } from '../SlateEditor/context'

type Props = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}
function KeyboardDismiss(props: Props) {
  const editor = useEditor()
  return (
    <TouchableWithoutFeedback
      sentry-label='KeyboardDismiss'
      style={props.style}
      onPress={() => {
        if (editor && editor.hasFocus?.()) {
          editor.blur()
        } else {
          Keyboard.dismiss()
        }
      }}
    >
      {props.children}
    </TouchableWithoutFeedback>
  )
}

export default KeyboardDismiss
