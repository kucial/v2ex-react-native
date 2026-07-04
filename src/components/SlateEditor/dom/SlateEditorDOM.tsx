'use dom'

import './index.css'

import React from 'react'
import { DOMImperativeFactory, useDOMImperativeHandle } from 'expo/dom'
import { throttle } from 'lodash'
import { Editor, Element, Range } from 'slate'
import { ReactEditor } from 'slate-react'

import SimpleRichEditor from './SimpleRichEditor'

const SimpleRichEditorComponent = SimpleRichEditor as React.ElementType

// ─── Types ───────────────────────────────────────────────────────────────────

export type EditorEventPayload =
  | { type: 'ready' }
  | { type: 'focus' }
  | { type: 'blur' }
  | {
      type: 'meta'
      canUndo: boolean
      canRedo: boolean
      inlineStyles: Record<string, boolean>
      blockTypes: string[]
    }
  | { type: 'viewport'; height: number; width: number }
  | {
      type: 'selection'
      selectionBox: {
        top: number
        bottom: number
        height: number
        width: number
      } | null
    }
  | { type: 'html'; value: string }
  | { type: 'markdown'; value: string }

export type SlateEditorDOMRef = {
  init(config: {
    html?: string
    placeholder?: string
    containerStyle?: Record<string, string | number>
  }): void
  focus(): void
  blur(): void
  getHTML(): void
  getMarkdown(): void
  toggleBlock(block: string): void
  toggleMark(mark: string): void
  listIndent(): void
  listOutdent(): void
  insertImage(url: string, width: number, height: number): void
  base64Encode(): void
  undo(): void
  redo(): void
}

type SlateEditorDOMInitConfig = {
  html?: string
  placeholder?: string
  containerStyle?: Record<string, string | number>
}

type Props = {
  dom?: import('expo/dom').DOMProps
  onEvent: (event: EditorEventPayload) => void
  ref?: React.Ref<SlateEditorDOMRef>
}

type EditorState = {
  refreshKey: number | undefined
  value: any[] | undefined
  placeholder: string | undefined
  focus: boolean
  containerStyle: React.CSSProperties
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SlateEditorDOM({ onEvent, ref }: Props) {
  // Ref to the Slate editor instance (exposed by SimpleRichEditor via forwardRef)
  const editorRef = React.useRef<any>(null)
  const domRef = React.useRef<HTMLDivElement>(null)
  const viewportRef = React.useRef<{ height: number; width: number }>({
    height: 0,
    width: 0,
  })
  const lastSelectionRef = React.useRef<any>(null)
  const shouldSkipFocusRef = React.useRef(false)

  const [editorState, setEditorState] = React.useState<EditorState>({
    refreshKey: undefined,
    value: undefined,
    placeholder: undefined,
    focus: false,
    containerStyle: { overflow: 'hidden' },
  })

  // ── Event helpers ──────────────────────────────────────────────────────────

  const postEvent = React.useCallback(
    (event: EditorEventPayload) => {
      onEvent(event)
    },
    [onEvent],
  )

  // ── Meta reporting ─────────────────────────────────────────────────────────

  const reportMeta = React.useCallback(() => {
    const editor = editorRef.current
    if (!editor) return
    const inlineStyles: Record<string, boolean> = {
      ...(Editor.marks(editor) as Record<string, boolean>),
    }
    let blockTypes: string[] = []
    if (editor.children && editor.selection) {
      try {
        const nodes = Array.from(
          Editor.nodes(editor, {
            at: Editor.unhangRange(editor, editor.selection),
            match: (n) =>
              !Editor.isEditor(n) &&
              Element.isElement(n) &&
              !Editor.isInline(editor, n),
          }),
        )
        blockTypes = Array.from(
          new Set(nodes.map(([n]) => (n as { type?: string }).type ?? '')),
        ).filter(Boolean)
      } catch {}
    }
    postEvent({
      type: 'meta',
      canUndo: !!editor.history?.undos?.length,
      canRedo: !!editor.history?.redos?.length,
      inlineStyles,
      blockTypes,
    })
  }, [postEvent])

  const imperativeHandle = React.useMemo<SlateEditorDOMRef>(
    () => ({
      init(config?: SlateEditorDOMInitConfig) {
        const { html, placeholder, containerStyle } = config || {}
        let value: any[]
        if (html) {
          const editor = editorRef.current
          if (editor?.html) {
            value = editor.html.fragmentFromHtml(html)
          } else {
            value = [{ type: 'paragraph', children: [{ text: '' }] }]
          }
        } else {
          value = [{ type: 'paragraph', children: [{ text: '' }] }]
        }
        setEditorState((prev) => ({
          ...prev,
          value,
          placeholder: placeholder ?? prev.placeholder,
          containerStyle: containerStyle
            ? (containerStyle as React.CSSProperties)
            : prev.containerStyle,
          refreshKey: Date.now(),
        }))
      },
      focus() {
        const editor = editorRef.current
        if (editor) ReactEditor.focus(editor)
      },
      blur() {
        const editor = editorRef.current
        if (editor) ReactEditor.blur(editor)
      },
      getHTML() {
        const editor = editorRef.current
        if (!editor?.html || !editorState.value) return
        postEvent({
          type: 'html',
          value: editor.html.htmlFromFragment(editorState.value),
        })
      },
      getMarkdown() {
        const editor = editorRef.current
        if (!editor?.md || !editorState.value) return
        postEvent({
          type: 'markdown',
          value: editor.md.mdFromFragment(editorState.value),
        })
      },
      toggleBlock(block: string) {
        editorRef.current?.toggleBlock(block)
      },
      toggleMark(mark: string) {
        editorRef.current?.toggleMark(mark)
      },
      listIndent() {
        editorRef.current?.listIndent()
      },
      listOutdent() {
        editorRef.current?.listOutdent()
      },
      insertImage(url: string, width: number, height: number) {
        editorRef.current?.insertImage({ url, width, height })
      },
      base64Encode() {
        editorRef.current?.base64Encode()
      },
      undo() {
        editorRef.current?.undo()
      },
      redo() {
        editorRef.current?.redo()
      },
    }),
    [postEvent, editorState.value],
  )

  useDOMImperativeHandle(
    ref as React.Ref<DOMImperativeFactory>,
    () => imperativeHandle as unknown as DOMImperativeFactory,
    [imperativeHandle],
  )

  // ── Viewport tracking ──────────────────────────────────────────────────────

  const triggerViewportUpdate = React.useCallback(() => {
    if (!domRef.current) return
    const { scrollHeight, clientWidth } = domRef.current
    if (
      scrollHeight === viewportRef.current.height &&
      clientWidth === viewportRef.current.width
    )
      return
    viewportRef.current = { height: scrollHeight, width: clientWidth }
    postEvent({ type: 'viewport', height: scrollHeight, width: clientWidth })
  }, [postEvent])

  // ── Selection tracking (throttled, matching App.js behaviour) ─────────────

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const triggerSelectionUpdate = React.useCallback(
    throttle(() => {
      const editor = editorRef.current
      if (!editor) return
      if (
        lastSelectionRef.current &&
        editor.selection &&
        Range.equals(editor.selection, lastSelectionRef.current)
      )
        return
      lastSelectionRef.current = editor.selection
        ? JSON.parse(JSON.stringify(editor.selection))
        : null

      let selectionBox: {
        top: number
        bottom: number
        height: number
        width: number
      } | null = null
      if (editor.selection) {
        if (Range.isCollapsed(editor.selection)) {
          try {
            const nodeEntry = Editor.above(editor, {
              match: (n) => Editor.isBlock(editor, n),
              at: editor.selection,
            })
            if (nodeEntry && Editor.isEmpty(editor, nodeEntry[0] as any)) {
              const anchorDom = ReactEditor.toDOMNode(
                editor,
                nodeEntry[0] as any,
              ) as HTMLElement
              selectionBox = {
                top: anchorDom.offsetTop,
                height: anchorDom.clientHeight,
                bottom: anchorDom.offsetTop + anchorDom.clientHeight,
                width: 0,
              }
            }
          } catch {}
        }
        if (!selectionBox) {
          try {
            const range = ReactEditor.toDOMRange(editor, editor.selection)
            const rect = range.getBoundingClientRect()
            selectionBox = {
              top: rect.top,
              bottom: rect.bottom,
              height: rect.height,
              width: rect.width,
            }
          } catch {}
        }
      }
      postEvent({ type: 'selection', selectionBox })
    }, 300),
    [postEvent],
  )

  // Run after each render to check for layout / selection changes
  React.useEffect(() => {
    triggerViewportUpdate()
    triggerSelectionUpdate()
  })

  // On mount: emit ready
  React.useEffect(() => {
    postEvent({ type: 'ready' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Value change handler ────────────────────────────────────────────────────

  const handleChange = React.useCallback(
    (_value: any[]) => {
      reportMeta()
    },
    [reportMeta],
  )

  // ── Render ────────────────────────────────────────────────────────────────

  if (!editorState.value) {
    // Not initialized yet — render empty placeholder container
    return <div />
  }

  return (
    <div
      style={editorState.containerStyle}
      ref={domRef}
      onClick={() => {
        const editor = editorRef.current
        if (!shouldSkipFocusRef.current && editor?.selection) {
          ReactEditor.focus(editor)
        }
      }}
    >
      <SimpleRichEditorComponent
        key={editorState.refreshKey}
        ref={editorRef}
        value={editorState.value}
        placeholder={editorState.placeholder}
        onChange={handleChange}
        onFocus={() => {
          setEditorState((prev) => ({ ...prev, focus: true }))
          postEvent({ type: 'focus' })
        }}
        onBlur={() => {
          shouldSkipFocusRef.current = true
          setTimeout(() => {
            shouldSkipFocusRef.current = false
          }, 500)
          setEditorState((prev) => ({ ...prev, focus: false }))
          postEvent({ type: 'blur' })
        }}
      />
    </div>
  )
}
