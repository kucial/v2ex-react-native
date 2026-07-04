import {
  forwardRef,
  ReactNode,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

import { EditorContext } from './context'
import type {
  EditorEventPayload,
  SlateEditorDOMRef,
} from './dom/SlateEditorDOM'
import {
  SlateEditorMethods,
  SlateEditorService,
  SlateEditorState,
} from './types'

type EditorProviderProps = {
  children: ReactNode
  onChange?(value: any): void
}

/**
 * EditorProvider — manages editor state and bridges the 'use dom' SlateEditorDOM
 * component with the rest of the RN component tree.
 *
 * Instead of the old injected WebView request-response bridge, we now
 * communicate with the Expo DOM component via:
 *   - Serializable props + onEvent callback (DOM → RN)
 *   - Imperative methods on a ref (RN → DOM)
 */
const EditorProvider = forwardRef<SlateEditorService, EditorProviderProps>(
  (props, ref) => {
    // Ref to the DOM component's imperative handle
    const domRef = useRef<SlateEditorDOMRef>(null)

    const [state, setState] = useState<SlateEditorState>({
      _ready: false,
      _hasFocus: false,
      meta: {},
      viewport: undefined,
    })

    // Pending promise resolvers for getHTML / getMarkdown calls
    const pendingHTML = useRef<((v: string) => void) | null>(null)
    const pendingMarkdown = useRef<((v: string) => void) | null>(null)

    // ── Event handler: receives events from the DOM component ──────────────

    const handleEvent = useCallback(
      (event: EditorEventPayload) => {
        switch (event.type) {
          case 'ready':
            // DOM component is mounted and ready; init will be called by EditorRender
            setState((prev) => ({ ...prev, _ready: false })) // will become true after init
            break
          case 'focus':
            setState((prev) => ({ ...prev, _hasFocus: true }))
            break
          case 'blur':
            setState((prev) => ({ ...prev, _hasFocus: false }))
            break
          case 'meta':
            setState((prev) => ({
              ...prev,
              _ready: true, // first meta after init means we're ready
              meta: {
                canUndo: event.canUndo,
                canRedo: event.canRedo,
                blockTypes: event.blockTypes,
                inlineStyles: event.inlineStyles,
              },
            }))
            break
          case 'viewport':
            setState((prev) => ({
              ...prev,
              viewport: { height: event.height, width: event.width },
            }))
            break
          case 'selection':
            setState((prev) => ({
              ...prev,
              selectionBox: event.selectionBox ?? undefined,
            }))
            break
          case 'html':
            pendingHTML.current?.(event.value)
            pendingHTML.current = null
            break
          case 'markdown':
            pendingMarkdown.current?.(event.value)
            pendingMarkdown.current = null
            break
          default:
            if (props.onChange) {
              props.onChange(event)
            }
        }
      },
      [props],
    )

    // ── Build the editor service object ────────────────────────────────────

    const methods: SlateEditorMethods = useMemo(
      () => ({
        init: (config) => {
          if (!domRef.current)
            return Promise.reject(new Error('DOM component not ready'))
          domRef.current.init({
            html: config.html,
            placeholder: config.placeholder,
            containerStyle: config.containerStyle as Record<
              string,
              string | number
            >,
          })
          return Promise.resolve()
        },
        focus: () => {
          domRef.current?.focus()
          return Promise.resolve()
        },
        blur: () => {
          domRef.current?.blur()
          return Promise.resolve()
        },
        getHTML: () =>
          new Promise<string>((resolve) => {
            pendingHTML.current = resolve
            domRef.current?.getHTML()
          }),
        getMarkdown: () =>
          new Promise<string>((resolve) => {
            pendingMarkdown.current = resolve
            domRef.current?.getMarkdown()
          }),
        toggleBlock: (block) => {
          domRef.current?.toggleBlock(block)
          return Promise.resolve()
        },
        toggleMark: (mark) => {
          domRef.current?.toggleMark(mark)
          return Promise.resolve()
        },
        listIndent: () => {
          domRef.current?.listIndent()
          return Promise.resolve()
        },
        listOutdent: () => {
          domRef.current?.listOutdent()
          return Promise.resolve()
        },
        insertImage: (args) => {
          domRef.current?.insertImage(args.url, args.width, args.height)
          return Promise.resolve()
        },
        base64Encode: () => {
          domRef.current?.base64Encode()
          return Promise.resolve()
        },
        undo: () => {
          domRef.current?.undo()
          return Promise.resolve()
        },
        redo: () => {
          domRef.current?.redo()
          return Promise.resolve()
        },
      }),
      [],
    )

    const editor: SlateEditorService = useMemo(
      () => ({
        ...state,
        isReady() {
          return !!state._ready
        },
        hasFocus() {
          return !!state._hasFocus
        },
        canUndo() {
          return !!state.meta.canUndo
        },
        canRedo() {
          return !!state.meta.canRedo
        },
        canIndent() {
          return !!state.meta.blockTypes?.includes('list-item')
        },
        canOutdent() {
          return !!state.meta.blockTypes?.includes('list-item')
        },
        isBlockActive(type) {
          return !!state.meta.blockTypes?.includes(type)
        },
        isMarkActive(type) {
          return !!state.meta.inlineStyles?.[type]
        },
        // kept for EditorRender to call after ready event
        setInitialConfig(config) {
          domRef.current?.init({
            html: config.html,
            placeholder: config.placeholder,
            containerStyle: config.containerStyle as Record<
              string,
              string | number
            >,
          })
        },
        webview: domRef as any,
        handleMessage: () => {
          // no-op: replaced by onEvent callback
        },
        ...methods,
      }),
      [state, methods],
    )

    useImperativeHandle(ref, () => editor)

    return (
      <EditorContext.Provider value={{ ...editor, domRef, handleEvent }}>
        {props.children}
      </EditorContext.Provider>
    )
  },
)

EditorProvider.displayName = 'EditorProvider'

export default EditorProvider
