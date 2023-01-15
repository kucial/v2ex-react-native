import { ReactNode } from 'react'
import { Keyboard, Pressable, ViewStyle } from 'react-native'

import { useEditor } from '../SlateEditor/context'

type Props = {
  children: ReactNode
  style: ViewStyle
}
export default function KeyboardDismiss(props: Props) {
  const editor = useEditor()
  return (
    <Pressable
      sentry-label="KeyboardDismiss"
      style={props.style}
      onPress={() => {
        if (editor && editor.hasFocus()) {
          editor.blur()
        } else {
          Keyboard.dismiss()
        }
      }}>
      {props.children}
    </Pressable>
  )
}
