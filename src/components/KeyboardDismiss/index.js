import { View, Pressable, Keyboard } from 'react-native'
import React from 'react'
import { useEditor } from '../SlateEditor/context'

export default function KeyboardDismiss(props) {
  const editor = useEditor()
  return (
    <Pressable
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
