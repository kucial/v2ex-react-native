import { Editor } from 'slate';
import deserialize, { defaultOptions as deOptions } from './deserialize';
import serialize, {
  defaultOptions as seOptions,
  defaultParser,
} from './serialize';

export const HtmlUtils = {
  fragmentFromHTML(editor, html) {
    return editor.fragmentFromHTML(html);
  },
  htmlFromFragment(editor, fragment) {
    return editor.htmlFromFragment(fragment);
  },
};

export const withHtml = (editor, options) => {
  editor.html = {
    // serialize
    styleOrder: seOptions.styleOrder,
    tagsExtracter: { ...seOptions.tagsExtracter },
    getCommonExtra: () => undefined,
    htmlFromFragment(fragment) {
      const nodes = fragment || editor.children;
      const options = {
        tagsExtracter: editor.html.tagsExtracter,
        styleOrder: editor.html.styleOrder,
        isBlock: (n) => Editor.isBlock(editor, n),
        getCommonExtra: editor.html.getCommonExtra,
      };
      return nodes.map((node) => serialize(node, options)).join('');
    },

    // deserialize
    attrsExtracter: {
      default: deOptions.elAttrsFromEl,
    },
    markAttrsFromEl(el, contextName) {
      return deOptions.markAttrsFromEl(el, contextName);
    },
    elAttrsFromEl(el, contextName) {
      const extracter =
        editor.html.attrsExtracter[contextName] ||
        editor.html.attrsExtracter.default;

      return extracter(el, contextName);
    },
    normalize(node) {
      return node;
    },
    fragmentFromHtml(html, parser = defaultParser) {
      const parsed = parser(html);
      const options = {
        elAttrsFromEl: editor.html.elAttrsFromEl,
        markAttrsFromEl: editor.html.markAttrsFromEl,
        normalize: editor.html.normalize,
      };
      return deserialize(parsed.body, options);
    },
  };

  return editor;
};
