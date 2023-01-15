import { ReactNode } from 'react'
import { Pressable, ViewStyle } from 'react-native'

import { useEditor } from './context'

type Props = {
  children: ReactNode
  style: ViewStyle
}
export default function EditorDismiss(props: Props) {
  const editor = useEditor()
  return (
    <Pressable
      style={props.style}
      onPress={() => {
        if (editor.hasFocus()) {
          editor.blur()
        }
      }}>
      {props.children}
    </Pressable>
  )
}
