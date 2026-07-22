import { ListType } from '@prezly/slate-lists'
import { createEditor } from 'slate'

import { withList } from '../index'

const createListEditor = (children) => {
  const editor = createEditor()
  editor.children = children
  editor.elementRenders = {}
  editor.renderElement = () => null
  editor.registerRender = (name, render) => {
    editor.elementRenders[name] = render
  }
  editor.isBlockActive = () => false
  editor.toggleBlock = () => {}
  editor.handleKeyDown = () => false
  return withList(editor)
}

describe('list', () => {
  it('preserves ordered list type when indenting an item', () => {
    const editor = createListEditor([
      {
        type: 'ordered-list',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'list-item-text', children: [{ text: 'One' }] }],
          },
          {
            type: 'list-item',
            children: [{ type: 'list-item-text', children: [{ text: 'Two' }] }],
          },
        ],
      },
    ])
    editor.selection = {
      anchor: { path: [0, 1, 0, 0], offset: 0 },
      focus: { path: [0, 1, 0, 0], offset: 0 },
    }

    expect(editor.isListNode(editor.children[0], ListType.ORDERED)).toBe(true)
    expect(editor.createListNode(ListType.ORDERED).type).toBe('ordered-list')

    editor.listIndent()

    expect(editor.children[0].type).toBe('ordered-list')
    expect(editor.children[0].children[0].children[1].type).toBe('ordered-list')
  })
})
