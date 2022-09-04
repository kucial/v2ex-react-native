import { useMemo, useRef, useState } from 'react'
import { forwardRef } from 'react'
import { nanoid } from 'nanoid'
import { captureMessage } from '@sentry/react-native'
import { EditorContext } from './context'

const EditorProvider = forwardRef((props, ref) => {
  const webviewRef = useRef()
  const requests = useRef({})
  const setInitialConfig = useRef({})
  const [state, setState] = useState({
    meta: {},
    hasFocus: false,
    viewport: {} // size
  })
  const operations = useMemo(() => {
    const mapMethods = (methods) => {
      const output = {}
      methods.forEach((method) => {
        output[method] = (...args) => {
          if (!webviewRef.current) {
            return Promise.reject(new Error('EditorWebView not ref...'))
          }
          return new Promise((resolve, reject) => {
            const requestId = nanoid()
            requests.current[requestId] = { resolve, reject }
            webviewRef.current.postMessage(
              JSON.stringify({
                requestId,
                method,
                args
              })
            )
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
      'toggleBlock',
      'toggleMark',
      'listIndent',
      'listOutdent',
      'insertImage',
      'undo',
      'redo'
    ])
  }, [])
  console.log(state)
  const editor = useMemo(() => {
    return {
      viewport: state.viewport,
      hasFocus() {
        return state.hasFocus
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
        console.log(data)
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
              operations.init(setInitialConfig.current).catch((err) => {
                captureMessage(err)
              })
              break
            case 'meta':
              setState((prev) => ({
                ...prev,
                meta: data.payload
              }))
              break
            case 'viewport':
              setState((prev) => ({
                ...prev,
                viewport: data.payload
              }))
              break
            case 'focus':
              setState((prev) => ({
                ...prev,
                hasFocus: true
              }))
            // TODO: may trigger blur
            case 'blur':
              setState((prev) => ({
                ...prev,
                hasFocus: false
              }))
            // TODO: may trigger blur
            default:
              console.log('NOT_HANDLED EVENT', data)
          }
        }
      },
      ...operations
    }
  }, [state, operations])

  return (
    <EditorContext.Provider value={editor}>
      {props.children}
    </EditorContext.Provider>
  )
})

EditorProvider.displayName = 'EditorProvider'

export default EditorProvider
