import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { Editable, withReact, Slate } from 'slate-react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';

import {
  withBaseExtend,
  withHtml,
  withRichText,
  withHr,
  withMarkdown,
  withBlockquote,
  withList,
} from './plugins';

const myCreateEditor = () => {
  return [
    withBaseExtend,
    withHtml,
    withRichText,
    withList,
    withBlockquote,
    withHr,
    withMarkdown,
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
        placeholder={props.placeholder}
        spellCheck
        autoFocus
        readOnly={props.readOnly}
        decorate={props.decorate}
        onKeyDown={editor.handleKeyDown}
      />
    </Slate>
  );
});

export default SimpleRichEditor