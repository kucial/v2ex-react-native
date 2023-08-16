import { CSSProperties, useEffect, useState } from 'react'
import { LayoutChangeEvent, Pressable, View } from 'react-native'
import WebView from 'react-native-webview'
import { useAssets } from 'expo-asset'
import * as FileSystem from 'expo-file-system'

import { useEditor } from './context'

type EditorRenderProps = {
  placeholder: string
  html?: string
  containerStyle: CSSProperties & { '--placeholder-color': string }
  onCursorPositionUpdate?(): void
  onLayout(e: LayoutChangeEvent): void
}

export default function EditorRender(props: EditorRenderProps) {
  const [assets, error] = useAssets([require('./assets/editor.html')])
  const [editorHtml, setEditorHTML] = useState('')

  useEffect(() => {
    if (assets) {
      FileSystem.readAsStringAsync(assets[0].localUri).then(setEditorHTML)
    }
  }, [assets])
  const editor = useEditor()
  useEffect(() => {
    editor.setInitialConfig({
      placeholder: props.placeholder,
      html: props.html,
      containerStyle: props.containerStyle,
    })
  }, [])

  useEffect(() => {
    props.onCursorPositionUpdate?.()
  }, [editor.selectionBox?.top, editor.selectionBox?.bottom])

  useEffect(() => {
    return () => {
      editor.blur()
    }
  }, [])

  return (
    <Pressable
      style={[editor.viewport]}
      onPress={(e) => {
        e.stopPropagation()
      }}
      onLayout={props.onLayout}>
      {editorHtml && (
        <WebView
          originWhitelist={['*']}
          allowFileAccess={true}
          source={{
            html: editorHtml,
          }}
          // source={{ uri: 'http://192.168.1.102:3000/editor.html' }}
          ref={editor.webview}
          onMessage={editor.handleMessage}
          allowingReadAccessToURL="file://"
          style={{
            opacity: editor.isReady() ? 1 : 0,
            backgroundColor: props.containerStyle?.backgroundColor,
            minHeight: props.containerStyle?.minHeight,
          }}
          scrollEnabled={false}
        />
      )}
    </Pressable>
  )
}
