import { ReactNode, useMemo, useRef, useState } from 'react'
import { forwardRef } from 'react'
import { useImperativeHandle } from 'react'
import WebView from 'react-native-webview'
import { captureMessage } from '@sentry/react-native'

import { EditorContext } from './context'
import {
  SlateEditorMethods,
  SlateEditorService,
  SlateEditorState,
} from './types'

let count = 0
const uniqId = () => {
  return `${Date.now()}-${count++}`
}

const DEBUG = false

type EditorProviderProps = {
  children: ReactNode
  onChange?(value: any): void
}
const EditorProvider = forwardRef<SlateEditorService, EditorProviderProps>(
  (props, ref) => {
    const webviewRef = useRef<WebView>()
    const requests = useRef({})
    const setInitialConfig = useRef({})
    const [state, setState] = useState<SlateEditorState>({
      _ready: false,
      _hasFocus: false,
      meta: {},
      viewport: undefined,
    })
    const operations = useMemo(() => {
      const mapMethods = (methods) => {
        const output = {} as SlateEditorMethods
        methods.forEach((method) => {
          output[method] = (...args) => {
            if (!webviewRef.current) {
              return Promise.reject(new Error('EditorWebView not ref...'))
            }
            return new Promise((resolve, reject) => {
              const requestId = `${method}-${uniqId()}`
              requests.current[requestId] = { resolve, reject }
              const actionScript = `window.dispatchEvent(new CustomEvent('editor-message', { detail: ${JSON.stringify(
                {
                  requestId,
                  method,
                  args,
                },
              )} }));`
              webviewRef.current.injectJavaScript(actionScript)
            })
          }
        })
        return output
      }
      return mapMethods([
        'init',
        'focus',
        'blur',
        // 'setHTML',
        'getHTML',
        'getMarkdown',
        'toggleBlock',
        'toggleMark',
        'listIndent',
        'listOutdent',
        'insertImage',
        'base64Encode',
        'undo',
        'redo',
      ])
    }, [])

    const editor: SlateEditorService = useMemo(() => {
      return {
        ...state,
        isReady() {
          return state._ready
        },
        hasFocus() {
          return state._hasFocus
        },
        canUndo() {
          return state.meta.canUndo
        },
        canRedo() {
          return state.meta.canRedo
        },
        canIndent() {
          return state.meta.blockTypes?.includes('list-item')
        },
        canOutdent() {
          return state.meta.blockTypes?.includes('list-item')
        },
        isBlockActive(type) {
          return state.meta.blockTypes?.includes(type)
        },
        isMarkActive(type) {
          return !!state.meta.inlineStyles?.[type]
        },
        setInitialConfig(config) {
          setInitialConfig.current = config
        },
        webview: webviewRef,
        handleMessage: (e) => {
          const data = JSON.parse(e.nativeEvent.data)
          if (DEBUG) {
            console.log('editor webview provider handleMessage', data)
          }
          if (data.requestId) {
            const { requestId, result } = data
            const { resolve, reject } = requests.current[requestId] || {}
            delete requests.current[requestId]
            if (result.error) {
              reject?.(result)
            } else {
              resolve?.(result)
            }
            return
          }
          if (data.type === 'event') {
            switch (data.name) {
              case 'ready':
                operations
                  .init(setInitialConfig.current)
                  .then(() => {
                    setState((prev) => ({
                      ...prev,
                      _ready: true,
                    }))
                  })
                  .catch((err) => {
                    console.log(err)
                    captureMessage(err)
                  })

                break
              case 'meta':
                setState((prev) => ({
                  ...prev,
                  meta: data.payload,
                }))
                break
              case 'viewport':
                setState((prev) => ({
                  ...prev,
                  viewport: data.payload,
                }))
                break
              case 'selection':
                // TODO: check if is equal
                setState((prev) => ({
                  ...prev,
                  ...data.payload,
                }))
                break
              case 'focus':
                setState((prev) => ({
                  ...prev,
                  _hasFocus: true,
                }))
                break
              case 'blur':
                setState((prev) => ({
                  ...prev,
                  _hasFocus: false,
                }))
                break
              case 'data':
                if (props.onChange) {
                  props.onChange(data)
                }
              default:
                console.log('NOT_HANDLED EVENT', data)
            }
          }
        },
        ...operations,
      }
    }, [state, operations])
    useImperativeHandle(ref, () => editor)

    return (
      <EditorContext.Provider value={editor}>
        {props.children}
      </EditorContext.Provider>
    )
  },
)

EditorProvider.displayName = 'EditorProvider'

export default EditorProvider
