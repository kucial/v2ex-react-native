import { useEffect } from 'react'
import { Pressable } from 'react-native'
import WebView from 'react-native-webview'
import PropTypes from 'prop-types'

import editorHtml from './assets/editor.html'
import { useEditor } from './context'

export default function EditorRender(props) {
  const editor = useEditor()
  useEffect(() => {
    editor.setInitialConfig({
      placeholder: props.placeholder,
      html: props.html,
      containerStyle: props.containerStyle
    })
  }, [])

  useEffect(() => {
    props.onCursorPositionUpdate?.()
  }, [editor.selectionBox?.top, editor.selectionBox?.bottom])

  return (
    <Pressable
      style={editor.viewport}
      onPress={(e) => {
        e.stopPropagation()
      }}
      onLayout={props.onLayout}>
      <WebView
        originWhitelist={['*']}
        source={editorHtml}
        // source={{ uri: 'http://192.168.1.102:3000/editor.html' }}
        ref={editor.webview}
        onMessage={editor.handleMessage}
        style={{
          opacity: editor.isReady() ? 1 : 0,
          backgroundColor: props.containerStyle?.backgroundColor,
          minHeight: props.containerStyle?.minHeight
        }}
        scrollEnabled={false}
      />
    </Pressable>
  )
}

EditorRender.propTypes = {
  minHeight: PropTypes.number
}
