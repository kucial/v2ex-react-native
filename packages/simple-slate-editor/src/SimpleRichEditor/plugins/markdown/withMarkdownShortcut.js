import { Transforms, Editor, Element, Range } from 'slate';

const SHORTCUTS = {
  '*': 'list-item',
  '-': 'list-item',
  '+': 'list-item',
  '>': 'blockquote',
  '#': 'heading-one',
  '##': 'heading-two',
  '###': 'heading-three',
  '####': 'heading-four',
  '#####': 'heading-five',
  '######': 'heading-six',
};

export default function withMarkdownShortcut(editor) {
  const { insertText } = editor;
  editor.insertText = (text) => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range);
      const type = SHORTCUTS[beforeText];

      if (type) {
        Transforms.select(editor, range);
        Transforms.delete(editor);
        const newProperties = {
          type,
        };

        if (type === 'blockquote') {
          Transforms.setNodes(
            editor,
            {
              type: 'paragraph',
            },
            {
              match: (n) => Editor.isBlock(editor, n),
            }
          );
          Transforms.wrapNodes(editor, {
            type: 'blockquote',
            children: [],
          });
        } else if (type === 'list-item') {
          Editor.withoutNormalizing(editor, () => {
            Transforms.setNodes(
              editor,
              {
                type: 'list-item-text',
              },
              {
                match: (n) => Editor.isBlock(editor, n),
              }
            );
            Transforms.wrapNodes(editor, {
              type: 'list-item',
              children: [],
            }, {
              match: (n) =>
              !Editor.isEditor(n) &&
                Element.isElement(n) &&
                n.type === 'list-item-text',
            });
            Transforms.wrapNodes(editor, {
              type: 'unordered-list',
              children: [],
            }, {
              match: (n) =>
                !Editor.isEditor(n) &&
                Element.isElement(n) &&
                n.type === 'list-item',
            });
          })
        } else {
          Transforms.setNodes(editor, newProperties, {
            match: (n) => Editor.isBlock(editor, n),
          });
        }
        return;
      }
      if (/\d+\./.test(beforeText)) {
        Editor.withoutNormalizing(editor, () => {
          Transforms.select(editor, range);
          Transforms.delete(editor);
          Transforms.setNodes(
            editor,
            {
              type: 'list-item-text',
            },
            {
              match: (n) => Editor.isBlock(editor, n),
            }
          );
          Transforms.wrapNodes(editor, {
            type: 'list-item',
            children: [],
          }, {
            match: (n) =>
            !Editor.isEditor(n) &&
              Element.isElement(n) &&
              n.type === 'list-item-text',
          });
          Transforms.wrapNodes(editor, {
            type: 'ordered-list',
            children: [],
          }, {
            match: (n) =>
              !Editor.isEditor(n) &&
              Element.isElement(n) &&
              n.type === 'list-item',
          });
        })
      }
    }

    insertText(text);
  };

  return editor;
}
