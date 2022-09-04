import { View } from 'react-native'
import { useEffect } from 'react'
import WebView from 'react-native-webview'
import { useEditor } from './context'

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
    <View style={editor.viewport}>
      <WebView
        ref={editor.webview}
        source={{ uri: 'http://192.168.1.102:3001' }}
        // source={editorHtml}
        onMessage={editor.handleMessage}
      />
    </View>
  )
}
