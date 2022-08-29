import { useEffect, useMemo } from 'react'
import { createContext, forwardRef, useRef, useImperativeHandle } from 'react'
import WebView from 'react-native-webview'

const EditorContext = createContext()

import editorHtml from './editor.html'
/**
 * Slate Editor In WebView
 * Features：
 * 1. 根据内容自动更新 webview 高度
 * 2. 提供初始方法，设置 editor 可用的功能
 *  2-1. 设置可用的段落样式
 * 3. editor context
 */

export default function SlateEditor(props) {
  const webview = useRef()
  const editor = useMemo(() => {
    return {
      init(config) {
        const script = `(function() {
          try {
            window._editor.init(${JSON.stringify(config)});
          } catch (err) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              error: true,
              message: err.message
            }))
          }
        }())`
        webview.current.injectJavaScript(script)
      }
    }
  }, [])

  return (
    <WebView
      ref={webview}
      style={props.style}
      source={{ uri: 'http://192.168.1.102:3000' }}
      // source={editorHtml}
      onMessage={(e) => {
        const data = JSON.parse(e.nativeEvent.data)
        console.log('....editor....', data)
        if (data.ready) {
          editor.init({
            placeholder: '内容',
            html: '<h1>测试一下</h1><p>测试正文内容初始化</p>'
          })
        }
      }}></WebView>
  )
}

export const EditorProvider = forwardRef((props, ref) => {
  const webviewRef = useRef()
  const editor = useMemo(() => {
    console.log('TODO')
  }, [])

  useImperativeHandle(ref, () => editor, [editor])

  return (
    <EditorContext.Provider value={editor}>
      {props.children}
    </EditorContext.Provider>
  )
})
EditorProvider.displayName = 'EditorProvider'
