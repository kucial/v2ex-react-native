import { Element, Editor, Transforms, Range } from 'slate'
import { ListsEditor, ListType, onKeyDown, withLists, withListsReact } from '@prezly/slate-lists';
import { log } from './helper'
import BulletedList from './BulletedList';
import ListItem from './ListItem';
import ListItemText from './ListItemText';
import OrderedList from './OrderedList'

const TYPE = {
  PARAGRAPH: 'paragraph',
  UNORDERED_LIST: 'unordered-list',
  ORDERED_LIST: 'ordered-list',
  LIST_ITEM: 'list-item',
  LIST_ITEM_TEXT: 'list-item-text'
}


const withListsPlugin = withLists({
  isConvertibleToListTextNode(node) {
      return Element.isElementType(node,TYPE.PARAGRAPH);
  },
  isDefaultTextNode(node) {
      return Element.isElementType(node,TYPE.PARAGRAPH);
  },
  isListNode(node, type) {
      if (type) {
          const nodeType =
              type === ListType.ORDERED_LIST ?TYPE.ORDERED_LIST :TYPE.UNORDERED_LIST;
          return Element.isElementType(node, nodeType);
      }
      return (
          Element.isElementType(node,TYPE.ORDERED_LIST) ||
          Element.isElementType(node,TYPE.UNORDERED_LIST)
      );
  },
  isListItemNode(node) {
      return Element.isElementType(node,TYPE.LIST_ITEM);
  },
  isListItemTextNode(node) {
      return Element.isElementType(node,TYPE.LIST_ITEM_TEXT);
  },
  createDefaultTextNode(props = {}) {
      return { children: [{ text: '' }], ...props, type:TYPE.PARAGRAPH };
  },
  createListNode(type = ListType.UNORDERED, props = {}) {
      const nodeType = type === ListType.ORDERED_LIST ?TYPE.ORDERED_LIST :TYPE.UNORDERED_LIST;
      return { children: [{ text: '' }], ...props, type: nodeType };
  },
  createListItemNode(props = {}) {
      return { children: [{ text: '' }], ...props, type:TYPE.LIST_ITEM };
  },
  createListItemTextNode(props = {}) {
      return { children: [{ text: '' }], ...props, type:TYPE.LIST_ITEM_TEXT };
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
  editor.registerRender(TYPE.UNORDERED_LIST, BulletedList);
  editor.registerRender(TYPE.ORDERED_LIST, OrderedList);
  editor.registerRender(TYPE.LIST_ITEM, ListItem);
  editor.registerRender(TYPE.LIST_ITEM_TEXT, ListItemText);

  if (editor.html) {
    editor.html.attrsExtracter.UL = () => ({ type: TYPE.UNORDERED_LIST })
    editor.html.attrsExtracter.OL = () => ({ type: TYPE.ORDERED_LIST })
    editor.html.attrsExtracter.LI = () => ({ type: TYPE.LIST_ITEM })

    editor.html.tagsExtracter[TYPE.UNORDERED_LIST] = () => [{ tag: 'ul' }];
    editor.html.tagsExtracter[TYPE.ORDERED_LIST] = () => [{ tag: 'ol' }];
    editor.html.tagsExtracter[TYPE.LIST_ITEM] = () => [{ tag: 'li' }];
  }

  editor =  withListKeyDown(withListsReact(withListsPlugin(editor)))


  const { toggleBlock } = editor;
  editor.toggleBlock = (blockType, options = {})  => {
    const { at = editor.selection } = options;
    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, at),
        match: (n) => editor.isListItemNode(n)
      })
    )
    if (!!match) {
      const active = editor.isBlockActive(blockType, options);
      if (active) {
        ListsEditor.unwrapList(editor, blockType);
        return;
      } else {
        Editor.withoutNormalizing(editor, () => {
          const [, path] = Editor.above(editor, {
            match: (n) => editor.isListNode(n)
          })
          Transforms.setNodes(editor,
            {
              type: blockType
            }, {
              at: path
            })
        });
      }
      return;
    } else if (blockType === TYPE.ORDERED_LIST ) {
      ListsEditor.wrapInList(editor, ListType.ORDERED);
      return;
    } else if (blockType === TYPE.UNORDERED_LIST ) {
      ListsEditor.wrapInList(editor, ListType.UNORDERED);
      return;
    }
    toggleBlock(blockType, options);
  }

  const { deleteBackward } = editor;
  editor.deleteBackward = () => {
    log('deleteBackward')
    if (Range.isCollapsed(editor.selection)) {
      const nodeEntry = Editor.above(editor, {
        at: editor.selection,
        match: n => editor.isListItemTextNode(n)
      })
      if (nodeEntry && Editor.isEmpty(editor, nodeEntry[0])) {
        ListsEditor.decreaseDepth(editor)
        return;
      }
    }
    deleteBackward();
  }

  editor.listIndent = () => {
    ListsEditor.increaseDepth(editor)
  }
  editor.listOutdent = () => {
    ListsEditor.decreaseDepth(editor)
  }

  return editor

}