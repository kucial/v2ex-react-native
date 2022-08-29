import { Element, Editor } from 'slate'
import { ListType, onKeyDown, withLists, withListsReact } from '@prezly/slate-lists';

import BulletedList from './BulletedList';
import ListItem from './ListItem';
import ListItemText from './ListItemText';
import OrderedList from './OrderedList'

const PARAGRAPH = 'paragraph';
const ELEMENT_TYPE_UNORDERED_LIST = 'unordered-list'
const ELEMENT_TYPE_ORDERED_LIST = 'ordered-list'
const ELEMENT_TYPE_LIST_ITEM = 'list-item';
const ELEMENT_TYPE_LIST_ITEM_TEXT = 'list-item-text';


const withListsPlugin = withLists({
  isConvertibleToListTextNode(node) {
      return Element.isElementType(node, PARAGRAPH);
  },
  isDefaultTextNode(node) {
      return Element.isElementType(node, PARAGRAPH);
  },
  isListNode(node, type) {
      if (type) {
          const nodeType =
              type === ListType.ORDERED_LIST ? ELEMENT_TYPE_ORDERED_LIST : ELEMENT_TYPE_UNORDERED_LIST;
          return Element.isElementType(node, nodeType);
      }
      return (
          Element.isElementType(node, ELEMENT_TYPE_ORDERED_LIST) ||
          Element.isElementType(node, ELEMENT_TYPE_UNORDERED_LIST)
      );
  },
  isListItemNode(node) {
      return Element.isElementType(node, ELEMENT_TYPE_LIST_ITEM);
  },
  isListItemTextNode(node) {
      return Element.isElementType(node, ELEMENT_TYPE_LIST_ITEM_TEXT);
  },
  createDefaultTextNode(props = {}) {
      return { children: [{ text: '' }], ...props, type: PARAGRAPH };
  },
  createListNode(type = ListType.UNORDERED, props = {}) {
      const nodeType = type === ListType.ORDERED_LIST ? ELEMENT_TYPE_ORDERED_LIST : ELEMENT_TYPE_UNORDERED_LIST;
      return { children: [{ text: '' }], ...props, type: nodeType };
  },
  createListItemNode(props = {}) {
      return { children: [{ text: '' }], ...props, type: ELEMENT_TYPE_LIST_ITEM };
  },
  createListItemTextNode(props = {}) {
      return { children: [{ text: '' }], ...props, type: ELEMENT_TYPE_LIST_ITEM_TEXT };
  },
});

const withListKeyDown = (editor) => {
  const { handleKeyDown } = editor;
  editor.handleKeyDown = (e) => {
    if (!handleKeyDown(e)) {
      onKeyDown(editor, e)
    }
  }
  return editor
}

export const withList = (editor, options) => {
  editor.registerRender(ELEMENT_TYPE_UNORDERED_LIST, BulletedList);
  editor.registerRender(ELEMENT_TYPE_ORDERED_LIST, OrderedList);
  editor.registerRender(ELEMENT_TYPE_LIST_ITEM, ListItem);
  editor.registerRender(ELEMENT_TYPE_LIST_ITEM_TEXT, ListItemText);

  if (editor.html) {
    editor.html.attrsExtracter.UL = () => ({ type: ELEMENT_TYPE_UNORDERED_LIST })
    editor.html.attrsExtracter.OL = () => ({ type: ELEMENT_TYPE_ORDERED_LIST })
    editor.html.attrsExtracter.LI = () => ({ type: ELEMENT_TYPE_LIST_ITEM })

    editor.html.tagsExtracter[ELEMENT_TYPE_UNORDERED_LIST] = () => [{ tag: 'ul' }];
    editor.html.tagsExtracter[ELEMENT_TYPE_ORDERED_LIST] = () => [{ tag: 'ol' }];
    editor.html.tagsExtracter[ELEMENT_TYPE_LIST_ITEM] = () => [{ tag: 'li' }];
  }

  editor =  withListKeyDown(withListsReact(withListsPlugin(editor)))

  const { toggleBlock } = editor;
    editor.toggleBlock = (blockType, options = {})  => {
    const { at = editor.sel } = options;
    const match = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, at),
        match: (n) => editor.isListItemNode(n)
      })
    )
    if (!!match) {
      const active = editor.isBlockActive(blockType, options);
      if (active) {
        //

      } else {
        Editor.withoutNormalizing(editor, () => {

        });
      }
      return;
    }
    toggleBlock(blockType, options);
  }

  return editor

}