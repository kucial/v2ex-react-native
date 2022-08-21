import { Transforms, Editor, Range } from 'slate'
import { log } from './helper'
import Image from './Image'
const BLOCK_TYPE_IMAGE = 'image'

export const withImage = (editor) => {
  if (editor.elementRenders) {
    editor.elementRenders[BLOCK_TYPE_IMAGE] = Image
  }

  if (editor.html) {
    editor.html.attrsExtracter.IMG = (el) => ({
      type: BLOCK_TYPE_IMAGE,
      data: {
        url: el.src,
        width: el.width,
        height: el.height,
      }
    })

    editor.html.tagsExtracter[BLOCK_TYPE_IMAGE] = (node) => [
      {
        tag: 'img',
        attrs: {
          src: node.data.url,
          width: node.data.width,
          height: node.data.height,
        }
      }
    ]
  }

  const { isVoid } = editor
  editor.isVoid = (element) => {
    return element.type === BLOCK_TYPE_IMAGE ? true : isVoid(element)
  }

  editor.insertImage = (data) => {
    const blockEntry = Editor.above(
      editor,
      {
        at: editor.selection,
        match: (n) => Editor.isBlock(editor, n),
      }
    )

    if (Editor.isEmpty(editor, blockEntry[0])) {
      Transforms.setNodes(editor,
        {
          type: BLOCK_TYPE_IMAGE,
          data,
        },
        {
        at: blockEntry[1],
      })
    } else {
      Editor.withoutNormalizing(editor, () => {
        editor.insertBreak();
        Transforms.setNodes(editor,
          {
            type: BLOCK_TYPE_IMAGE,
            data,
          },
          {
          at: blockEntry[1],
        })
      })
    }
  }

  const { deleteBackward } = editor;
  editor.deleteBackward = () => {
    if (editor.isBlockActive(BLOCK_TYPE_IMAGE) && Range.isCollapsed(editor.selection)) {
      log('handle deleteBackward')
      const imageNode = Editor.above(editor, {
        at: editor.selection,
        match: (n) => n.type === BLOCK_TYPE_IMAGE
      })
      Transforms.removeNodes(editor, { at: imageNode[1] })
      return;
    }
    deleteBackward();
  }

  // make sure a block after image
  const { normalizeNode } = editor;
  editor.normalizeNode = (entry) => {
    const [node, path] = entry;
    if (node.type === BLOCK_TYPE_IMAGE) {
      // get next siblings
      const nextSibling = editor.nextSibling(path);
      if (!nextSibling) {
        const siblingPath = [
          ...path.slice(0, -1),
          path[path.length - 1] + 1,
        ]
        Editor.withoutNormalizing(editor, () => {
          Transforms.insertNodes(editor, {
            type: 'paragraph',
            children: [{text: ''}]
          }, {
            at: siblingPath,
            // select: true
          })
        });
        return;
      }
    }
    normalizeNode(entry);
  }

  return editor
}
