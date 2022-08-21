import { withRichText } from '../index';
import { withBaseExtend } from '../../base-extend';
import { createEditor, Editor, Transforms } from 'slate';

describe('rich-text', () => {
  const initEditor = (doc) => {
    const editor = withRichText(withBaseExtend(createEditor()));
    if (doc) {
      editor.children = doc;
    }
    return editor;
  };
  describe('deleteBackward', () => {
    it('reset blockType if block is empty', () => {
      const editor = initEditor([
        {
          type: 'heading-two',
          children: [
            {
              text: '',
            },
          ],
        },
      ]);
      Transforms.select(editor, [0]);
      editor.deleteBackward();
      const blockEntry = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });
      expect(blockEntry[0].type).toBe('paragraph');
      editor.deleteBackward();
      expect(blockEntry[0].type).toBe('paragraph');
    });
  });

  describe('insertBreak', () => {
    it('reset blockType when insert a new block', () => {
      const editor = initEditor([
        {
          type: 'heading-two',
          children: [{ text: 'Heading two' }],
        },
      ]);
      Transforms.select(editor, Editor.end(editor, [0]));
      editor.insertBreak();
      const blockEntry = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });
      expect(blockEntry[0].type).toBe('paragraph');
    });
  });
});
