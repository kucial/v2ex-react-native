import {  Range, Transforms } from 'slate'
import { encode } from 'js-base64'

export const withBase64Encode  = (editor) => {
  editor.base64Encode = (options = {}) => {
    const { at = editor.selection } = options
    if (Range.isCollapsed(at)) {
      return;
    }

    const selectedText = window.getSelection().toString()
    const textToReplace = encode(selectedText)

    Transforms.insertText(editor, textToReplace, {
      at,
    })

  }

  return editor
}