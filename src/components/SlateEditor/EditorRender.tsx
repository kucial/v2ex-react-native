import { CSSProperties, useEffect } from 'react'
import { LayoutChangeEvent, Pressable } from 'react-native'

import { useEditor } from './context'
// 'use dom' component — Expo will bundle this as an in-app DOM component
// transparently, so we just import and use it like any React component.
import SlateEditorDOM from './dom/SlateEditorDOM'

type EditorRenderProps = {
  placeholder: string
  html?: string
  containerStyle: CSSProperties & { '--placeholder-color'?: string }
  onCursorPositionUpdate?(): void
  onLayout?(e: LayoutChangeEvent): void
}

export default function EditorRender(props: EditorRenderProps) {
  const {
    containerStyle,
    html,
    onCursorPositionUpdate,
    onLayout,
    placeholder,
  } = props
  const editor = useEditor()

  // Set the initial config once on mount; the 'ready' event from the DOM
  // component triggers init (via setInitialConfig stored in EditorProvider).
  useEffect(() => {
    editor.setInitialConfig({
      placeholder,
      html,
      containerStyle,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    onCursorPositionUpdate?.()
  }, [
    editor.selectionBox?.top,
    editor.selectionBox?.bottom,
    onCursorPositionUpdate,
  ])

  useEffect(() => {
    return () => {
      editor.blur()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Pressable
      style={[editor.viewport]}
      onPress={(e) => {
        e.stopPropagation()
      }}
      onLayout={onLayout}
    >
      <SlateEditorDOM
        ref={editor.domRef}
        onEvent={editor.handleEvent}
        dom={{
          // Disable DOM scrolling since we manage it in RN
          scrollEnabled: false,
          // Resize to match the HTML content height
          matchContents: true,
          style: {
            opacity: editor.isReady() ? 1 : 0,
            backgroundColor:
              (containerStyle?.backgroundColor as string) ?? 'transparent',
          },
        }}
      />
    </Pressable>
  )
}
