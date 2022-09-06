import { View } from 'react-native'
import { useEffect } from 'react'
import WebView from 'react-native-webview'
import { useEditor } from './context'
import editorHtml from './assets/editor.html'

export default function EditorRender(props) {
  const editor = useEditor()
  useEffect(() => {
    editor.setInitialConfig({
      placeholder: props.placeholder,
      html: props.html
    })
  }, [])
  console.log(editor.viewport)
  return (
    <View style={{ height: 300 }}>
      {/* <View style={editor.viewport}> */}
      <WebView
        originWhitelist={['*']}
        // source={{ uri: 'http://192.168.1.102:3000/editor.html' }}
        source={editorHtml}
        ref={editor.webview}
        onMessage={editor.handleMessage}
      />
    </View>
  )
}
