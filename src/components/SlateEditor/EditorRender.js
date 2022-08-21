import { Pressable, View } from 'react-native'
import PropTypes from 'prop-types'
import { useEffect } from 'react'
import WebView from 'react-native-webview'
import { useEditor } from './context'
import editorHtml from './assets/editor.html'

export default function EditorRender(props) {
  const editor = useEditor()
  useEffect(() => {
    editor.setInitialConfig({
      placeholder: props.placeholder,
      html: props.html,
      containerStyle: props.containerStyle
    })
    // if (props.onBlur) {
    //   editor.subscribe('blur', props.onBlur)
    // }
    // if (props.onChange) {
    //   editor.subscribe('change', props.onChange)
    // }
    // return () => {
    //   if (props.onBlur) {
    //     editor.unsubscribe('blur', props.onBlur)
    //   }
    //   if (props.onChange) {
    //     editor.unsubscribe('change', props.onChange)
    //   }
    // }
  }, [])
  return (
    // <View style={{ height: 300 }}>
    <Pressable
      style={editor.viewport}
      onPress={(e) => {
        e.stopPropagation()
      }}>
      <WebView
        originWhitelist={['*']}
        // source={{ uri: 'http://192.168.1.102:3000/editor.html' }}
        source={editorHtml}
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
