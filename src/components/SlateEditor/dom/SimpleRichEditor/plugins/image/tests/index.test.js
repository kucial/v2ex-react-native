import { createEditor, Transforms } from 'slate'

import { withImage } from '../index'

describe('image', () => {
  const image = {
    url: 'https://example.com/image.png',
    width: 640,
    height: 480,
  }

  const initEditor = (text = '') => {
    const editor = withImage(createEditor())
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text }],
      },
    ]
    return editor
  }

  it('appends an image when the native picker has cleared the selection', () => {
    const editor = initEditor()

    editor.insertImage(image)

    expect(editor.children[1]).toMatchObject({
      type: 'image',
      data: image,
    })
  })

  it('inserts an image after a non-empty selected block', () => {
    const editor = initEditor('Existing content')
    Transforms.select(editor, [0])

    editor.insertImage(image)

    expect(editor.children[0].children[0].text).toBe('Existing content')
    expect(editor.children[1]).toMatchObject({
      type: 'image',
      data: image,
    })
  })
})
