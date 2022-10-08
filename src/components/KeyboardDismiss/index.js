import React from 'react'
import { Keyboard, Pressable, View } from 'react-native'

import { useEditor } from '../SlateEditor/context'

export default function KeyboardDismiss(props) {
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
