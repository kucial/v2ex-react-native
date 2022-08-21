// inject pubsub model
// inject renderLeaf
// inject renderElement

import { Transforms, Editor, Path, Node, Element, Range } from 'slate';
import { isKeyHotkey } from 'is-hotkey';
import { log } from './helper';

export const withBaseExtend = (editor) => {
  editor.elementRenders = {
    default: ({ attributes, children, element }) => {
      return <p {...attributes}>{children}</p>;
    },
  };

  editor.renderElement = (props) => {
    const { element } = props;
    const Element =
      editor.elementRenders[element.type] || editor.elementRenders.default;
    return <Element {...props} />;
  };

  editor.renderLeaf = ({ attributes, children }) => (
    <span {...attributes}>{children}</span>
  );

  editor.prevSibling = (path) => {
    const prevEntry = Editor.previous(editor, {
      at: path,
    });
    if (prevEntry && Path.isSibling(path, prevEntry[1])) {
      return prevEntry;
    }
    return null;
  };

  editor.nextSibling = (path) => {
    const nextEntry = Editor.next(editor, { at: path });
    if (nextEntry && Path.isSibling(path, nextEntry[1])) {
      return nextEntry;
    }
    return null;
  };

  editor.exitBlock = () => {
    const { selection } = editor;
    if (!selection) {
      return;
    }
    const blockEntry = Editor.above(editor, {
      at: editor.selection,
      match: (n) => Editor.isBlock(editor, n),
      mode: 'highest',
    });
    const after = Editor.after(editor, blockEntry[1]);
    if (after) {
      Transforms.select(editor, {
        anchor: after,
        focus: after,
      });
    } else {
      const nextPath = Path.next(blockEntry[1]);
      editor.apply({
        type: 'insert_node',
        node: {
          type: 'paragraph',
          children: [],
        },
        path: nextPath,
      });
      Transforms.select(editor, nextPath);
      // reset an unwrap
    }
  };

  const { deleteBackward } = editor;
  editor.deleteBackward = (unit) => {
    log('deleteBackward');
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const blockEntry = Editor.above(editor, {
        at: selection,
        match: (n) => Editor.isBlock(editor, n),
      });
      const currentIsVoid = Editor.isVoid(editor, blockEntry[0]);
      const prevBlockEntry = editor.prevSibling(blockEntry[1]);
      const nextBlockEntry = editor.nextSibling(blockEntry[1]);
      if (currentIsVoid) {
        log('remove current block and focus in previous end');
        if (prevBlockEntry) {
          Editor.withoutNormalizing(editor, () => {
            Transforms.removeNodes(editor, {
              at: selection,
              voids: true,
            });
            const prevEnd = Editor.end(editor, prevBlockEntry[1]);
            Transforms.select(editor, {
              focus: prevEnd,
              anchor: prevEnd,
            });
          });
          return;
        }
        if (!prevBlockEntry && !nextBlockEntry) {
          log('current is void and is the only child');
          Editor.withoutNormalizing(editor, () => {
            Transforms.removeNodes(editor, {
              at: selection,
              voids: true,
            });
            Transforms.insertNodes(
              editor,
              {
                type: 'paragraph',
                children: [
                  {
                    text: '',
                  },
                ],
              },
              {
                at: [0],
              }
            );
            Transforms.select(editor, [0]);
            return;
          });
        }
      }

      if (prevBlockEntry) {
        const prevIsVoid = Editor.isVoid(editor, prevBlockEntry[0]);
        if (prevIsVoid && Editor.isEmpty(editor, blockEntry[0])) {
          log('remove current block an focus in previous block');
          Editor.withoutNormalizing(editor, () => {
            Transforms.removeNodes(editor, {
              at: selection,
              // voids: true,
            });
            Transforms.select(editor, prevBlockEntry[1]);
          });
          return;
        }
      }
    }
    deleteBackward(unit);
  };

  const { normalizeNode } = editor;
  editor.normalizeNode = (entry) => {
    const [node, path] = entry;
    log(node, path);
    if (node.__SHOULD_REMOVE__) {
      Transforms.removeNodes(editor, {
        at: path,
      });
      return;
    }
    normalizeNode(entry);
    if (node.__REMOVE_IF_EMPTY__) {
      const currentNode = Node.get(editor, path);
      if (
        Element.isElement(currentNode) &&
        Editor.isEmpty(editor, currentNode)
      ) {
        Transforms.removeNodes(editor, {
          at: path,
        });
      }
    }
    // fix empty children
    if (Editor.isEditor(node) && node.children.length === 0) {
      Editor.withoutNormalizing(editor, () => {
        Transforms.insertNodes(editor, {
          type: 'paragraph',
          children: [
            { text: ''}
          ]
        })
      })
    }
  };

  editor.handleKeyDown = (e) => {
    const { nativeEvent } = e;
    if (isKeyHotkey('cmd+enter')(nativeEvent)) {
      editor.exitBlock?.();
      return true;
    }
  }

  return editor;
};
