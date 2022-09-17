import { View, Pressable } from 'react-native'
import React from 'react'
import { useEditor } from './context'

export default function EditorDismiss(props) {
  const editor = useEditor()
  return (
    <Pressable
      style={props.style}
      onPress={() => {
        editor.blur()
      }}>
      {props.children}
    </Pressable>
  )
}