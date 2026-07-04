// @ts-nocheck
import { forwardRef, useImperativeHandle, useMemo } from 'react'
import { createEditor } from 'slate'
import { withHistory } from 'slate-history'
import { Editable, Slate, withReact } from 'slate-react'

import {
  withBase64Encode,
  withBaseExtend,
  withBlockquote,
  withHr,
  withHtml,
  withImage,
  withList,
  withMarkdown,
  withMarkdownShortcut,
  withRichText,
} from './plugins'

const myCreateEditor = () => {
  return [
    withBaseExtend,
    withHtml,
    withMarkdown,
    withRichText,
    withList,
    withBlockquote,
    withImage,
    withHr,
    withMarkdownShortcut,
    withBase64Encode,
    withHistory,
  ].reduce((base, plugin) => plugin(base), withReact(createEditor()))
}

const SimpleRichEditor = forwardRef((props, ref) => {
  const editor = useMemo(() => {
    return myCreateEditor()
  }, [])
  useImperativeHandle(ref, () => editor, [editor])

  if (!props.value) {
    return null
  }
  return (
    <Slate editor={editor} value={props.value} onChange={props.onChange}>
      <Editable
        renderElement={editor.renderElement}
        renderLeaf={editor.renderLeaf}
        onKeyDown={editor.handleKeyDown}
        spellCheck
        autoFocus={props.autoFocus}
        readOnly={props.readOnly}
        decorate={props.decorate}
        onFocus={props.onFocus}
        placeholder={props.placeholder}
        onBlur={props.onBlur}
      />
    </Slate>
  )
})

SimpleRichEditor.displayName = 'SimpleRichEditor'

export default SimpleRichEditor
