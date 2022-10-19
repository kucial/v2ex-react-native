import { Pressable } from 'react-native'

import { useEditor } from './context'

export default function EditorDismiss(props) {
  const editor = useEditor()
  return (
    <Pressable
      style={props.style}
      onPress={() => {
        if (editor.hasFocus) {
          editor.blur()
        }
      }}>
      {props.children}
    </Pressable>
  )
}
