import { Editor, Transforms, Range } from 'slate'
import Blockquote from './Blockquote'
import { log } from './helper'

const BLOCKQUOTE = 'blockquote'

export const withBlockquote = (editor) => {
  editor.registerRender(BLOCKQUOTE, Blockquote)
  if (editor.html) {
    editor.html.attrsExtracter.BLOCKQUOTE = () => ({ type: BLOCKQUOTE })

    editor.html.tagsExtracter[BLOCKQUOTE] = () => [{ tag: 'blockquote' }]
  }

  const { normalizeNode } = editor
  editor.normalizeNode = (entry) => {
    log('normalizeNode')
    const [node, path] = entry
    if (
      node.type === BLOCKQUOTE &&
      Editor.above(editor, {
        at: path,
        match: (n) => n.type === BLOCKQUOTE
      })
    ) {
      log('reset block type')
      Transforms.unwrapNodes(editor, {
        at: path
      })
      return
    }

    normalizeNode(entry)
  }

  const { toggleBlock } = editor
  editor.toggleBlock = (blockType, options = {}) => {
    if (blockType === BLOCKQUOTE) {
      const { at = editor.selection } = options;
      if (editor.isBlockActive(blockType)) {
        const nodeEntry = Editor.above(editor, {
          at,
          match:  (n) => n.type === BLOCKQUOTE,
        })
        Transforms.unwrapNodes(editor, {
          at: nodeEntry[1]
        })
      } else {
        Transforms.wrapNodes(editor, {
          type: BLOCKQUOTE,
          children: [],
        });
      }

      return;
    }
    toggleBlock(blockType, options);
  }

  const { deleteBackward } = editor
  editor.deleteBackward = () => {
    log('deleteBackward')
    if (Range.isCollapsed(editor.selection)) {
      const blockquoteEntry = Editor.above(editor, {
        at: editor.selection,
        match: (n) => n.type === BLOCKQUOTE
      })
      if (
        blockquoteEntry &&
        blockquoteEntry[0].children.length === 1 &&
        blockquoteEntry[0].children[0].type === 'paragraph' &&
        Editor.isEmpty(editor, blockquoteEntry[0].children[0])
      ) {
        Transforms.unwrapNodes(editor, {
          at: blockquoteEntry[1],
        })
        return;
      }
    }
    deleteBackward()
  }

  // TODO double return to exit blockquote

  return editor
}
