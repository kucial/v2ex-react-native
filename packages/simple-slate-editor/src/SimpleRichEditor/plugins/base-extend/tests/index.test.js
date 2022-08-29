import { createEditor, Transforms } from 'slate';
import { withBaseExtend } from '../index';

describe('base extend', () => {
  const initEditor = (children) => {
    const editor = withBaseExtend(createEditor());
    const { isVoid } = editor;
    editor.isVoid = (n) => n.type === 'void' || isVoid(n);
    if (children) {
      editor.children = children;
    }
    return editor;
  };
  describe('deleteBackword', () => {
    it('current is empty, prev is void, delete current block and selection focus in prev void', () => {
      const editor = initEditor([
        {
          type: 'paragraph',
          children: [{ text: 'void related delete backward' }],
        },
        {
          type: 'void',
          children: [
            {
              text: '',
            },
          ],
        },
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ]);
      Transforms.select(editor, [2]);
      editor.deleteBackward();
      expect(editor.selection).toEqual({
        anchor: {
          path: [1, 0],
          offset: 0,
        },
        focus: {
          path: [1, 0],
          offset: 0,
        },
      });
      expect(editor.children.length).toEqual(2);
    });

    it('current is void, and prev block exists: remove block and focus in prev block end', () => {
      const text = 'This is a paragraph';
      const editor = initEditor([
        {
          type: 'paragraph',
          children: [{ text }],
        },
        {
          type: 'void',
          children: [{ text: '' }],
        },
      ]);
      Transforms.select(editor, [1]);
      editor.deleteBackward();
      expect(editor.children.length).toBe(1);
      expect(editor.selection).toEqual({
        anchor: {
          path: [0, 0],
          offset: text.length,
        },
        focus: {
          path: [0, 0],
          offset: text.length,
        },
      });
    });
    it('current is void, and no prev block', () => {
      const editor = initEditor([
        {
          type: 'void',
          children: [{ text: '' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'paragraph' }],
        },
      ]);
      Transforms.select(editor, [0]);
      editor.deleteBackward();
      expect(editor.children.length).toEqual(1);
      const node = editor.children[0];
      expect(node).toEqual({
        type: 'paragraph',
        children: [{ text: 'paragraph' }],
      });
      expect(editor.selection).toEqual({
        focus: {
          path: [0, 0],
          offset: 0,
        },
        anchor: {
          path: [0, 0],
          offset: 0,
        },
      });
    });
    it('current is void, and is the only block: remove block and insert a paragraph block', () => {
      const editor = initEditor([
        {
          type: 'void',
          children: [
            {
              text: '',
            },
          ],
        },
      ]);
      Transforms.select(editor, [0]);
      editor.deleteBackward();
      expect(editor.children.length).toBe(1);
      const node = editor.children[0];
      expect(node.type).toBe('paragraph');
      expect(editor.selection).toEqual({
        focus: { path: [0, 0], offset: 0 },
        anchor: { path: [0, 0], offset: 0 },
      });
    });
  });
});
