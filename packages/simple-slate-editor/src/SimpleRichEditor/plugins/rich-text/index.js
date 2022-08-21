import {
  Editor,
  Element as SlateElement,
  Transforms,
  Range,
} from 'slate';
import { BLOCK_TYPES } from './constants';
import Element from './Element';
import Leaf from './Leaf';
import { log } from './helper';

const isBlockActive = (editor, blockType, options = {}) => {
  const { at = editor.selection, typeKey = 'type' } = options;
  console.log('isBlockActive', editor.children)
  if (!at) {
    return false;
  }
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, at),
      match: (n) => {
        console.log(n)
        return (
          !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[typeKey] === blockType
        )
      }
        ,
    })
  );
  return !!match
};

const toggleBlock = (editor, blockType, options = {}) => {
  const isActive = isBlockActive(editor, blockType, options);
  Transforms.setNodes(
    editor,
    {
      type: isActive ? BLOCK_TYPES.P : blockType,
    },
    options
  );
};

const isMarkActive = (editor, format, options) => {
  const marks = Editor.marks(editor, options);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export const RichUtils = {
  isBlockActive,
  toggleBlock,
  isMarkActive,
  toggleMark,
};

export const withRichText = (editor) => {
  // Replace default element render;
  if (editor.elementRenders && editor.renderElement) {
    editor.elementRenders.default = Element;
  } else {
    editor.renderElement = Element;
  }

  editor.renderLeaf = Leaf;
  editor.registerRender = (name, render) => {
    if (editor.elementRenders[name]) {
      console.warn(`${name} element render exists`);
    }
    editor.elementRenders[name] = render;
  };

  Object.keys(RichUtils).forEach((key) => {
    editor[key] = (...args) => {
      return RichUtils[key](editor, ...args);
    };
  });

  const { insertBreak } = editor;
  editor.insertBreak = () => {
    log('insertBreak');
    Editor.withoutNormalizing(editor, () => {
      const { selection } = editor;
      if (!selection) {
        return;
      }
      insertBreak();
      Transforms.setNodes(editor, {
        type: BLOCK_TYPES.P,
      });
    });
  };

  const { deleteBackward } = editor;
  editor.deleteBackward = () => {
    log('deleteBackward');
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const blockEntry = Editor.above(editor, {
        at: selection,
        match: (n) => Editor.isBlock(editor, n),
      });
      if (
        blockEntry &&
        Editor.isEmpty(editor, blockEntry[0]) &&
        blockEntry[0].type !== 'paragraph'
      ) {
        Transforms.setNodes(editor, {
          type: 'paragraph',
        });
        return;
      }
    }
    deleteBackward();
  };

  return editor;
};
