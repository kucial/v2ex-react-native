import { ReactNode } from 'react'
import { Keyboard, TouchableWithoutFeedback } from 'react-native'

import { useEditor } from '../SlateEditor/context'

type Props = {
  children: ReactNode
  className?: string
}
function KeyboardDismiss(props: Props) {
  const editor = useEditor()
  return (
    <TouchableWithoutFeedback
      sentry-label='KeyboardDismiss'
      className={props.className}
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
