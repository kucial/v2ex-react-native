import { Pressable, View } from 'react-native'
import PropTypes from 'prop-types'
import { useEffect, useMemo } from 'react'
import WebView from 'react-native-webview'
import { useEditor } from './context'
import editorHtml from './assets/editor.html'
import { useRef } from 'react'
import composeRefs from '@seznam/compose-react-refs'

export default function EditorRender(props) {
  const editor = useEditor()
  const ref = useRef()
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

  const styleScript = useMemo(() => {
    const script = `(function() {
      try {
        let style = document.getElementById('style-vars');
        if (!style) {
          style = document.createElement('style');
          style.id = 'style-vars';
          style.type = 'text/css';
        } else {
          style.textContent = '';
        }

        style.appendChild(document.createTextNode(${JSON.stringify(
          `
            :root {
              --color-text: ${props.textColor};
              --color-background: ${props.backgroundColor};
              --color-placeholder: ${props.placeholderTextColor};
              --color-caret: ${props.selectionColor};
              --color-blockquote-border: ${props.blockquoteBorderColor};
            }
            `
        )}))
        document.head.appendChild(style);
      } catch (err) {

      }
    }())`
    return script
  }, [props.selectionColor, props.placeholderTextColor])

  // update style
  useEffect(() => {
    if (!ref.current) {
      return
    }
    ref.current.injectJavaScript(styleScript)
  }, [styleScript])

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
        injectedJavaScript={styleScript}
        ref={composeRefs(editor.webview, ref)}
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
