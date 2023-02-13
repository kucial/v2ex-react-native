import { CSSProperties, useEffect } from 'react'
import { LayoutChangeEvent, Platform, Pressable } from 'react-native'
import WebView from 'react-native-webview'

import { useEditor } from './context'

type EditorRenderProps = {
  placeholder: string
  html?: string
  containerStyle: CSSProperties
  onCursorPositionUpdate?(): void
  onLayout(e: LayoutChangeEvent): void
}

export default function EditorRender(props: EditorRenderProps) {
  const source =
    Platform.OS === 'ios'
      ? 'Static.bundle/editor.html'
      : 'file:///android_asset/editor.html'

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

  return (
    <Pressable
      style={[editor.viewport]}
      onPress={(e) => {
        e.stopPropagation()
      }}
      onLayout={props.onLayout}>
      <WebView
        originWhitelist={['*']}
        source={{
          uri: source,
        }}
        // source={{ uri: 'http://192.168.1.102:3000/editor.html' }}
        ref={editor.webview}
        onLoad={(e) => {
          console.log('...onLoad...')
        }}
        onMessage={editor.handleMessage}
        allowingReadAccessToURL="file://"
        style={{
          opacity: editor.isReady() ? 1 : 0,
          backgroundColor: props.containerStyle?.backgroundColor,
          minHeight: props.containerStyle?.minHeight,
        }}
        scrollEnabled={false}
      />
    </Pressable>
  )
}
