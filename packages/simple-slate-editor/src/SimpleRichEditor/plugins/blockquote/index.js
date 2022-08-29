import { Editor, Transforms } from 'slate';
import Blockquote from './Blockquote';
import { log } from './helper';

const BLOCKQUOTE = 'blockquote';

export const withBlockquote = (editor) => {
  editor.registerRender(BLOCKQUOTE, Blockquote);
  if (editor.html) {
    editor.html.attrsExtracter.BLOCKQUOTE = () => ({ type: BLOCKQUOTE });

    editor.html.tagsExtracter[BLOCKQUOTE] = () => [({ tag: 'blockquote' })]
  }

  const { normalizeNode } = editor;
  editor.normalizeNode = (entry) => {
    log('normalizeNode');
    const [node, path] = entry;
    if (
      node.type === BLOCKQUOTE &&
      Editor.above(editor, {
        at: path,
        match: (n) => n.type === BLOCKQUOTE,
      })
    ) {
      log('reset block type');
      Transforms.unwrapNodes(editor, {
        at: path,
      });
      return;
    }

    normalizeNode(entry);
  };

  return editor;
};
