import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { Editable, withReact, Slate } from 'slate-react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';

import {
  withBaseExtend,
  withHtml,
  withMarkdown,
  withRichText,
  withHr,
  withMarkdownShortcut,
  withBlockquote,
  withList,
  withImage
} from './plugins';

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
    withHistory,
  ].reduce((base, plugin) => plugin(base), withReact(createEditor()));
};

const SimpleRichEditor = forwardRef((props, ref) => {
  const editor = useMemo(() => {
    return myCreateEditor();
  }, []);
  useImperativeHandle(ref, () => editor, [editor])

  if (!props.value) {
    return null;
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
  );
});

export default SimpleRichEditor