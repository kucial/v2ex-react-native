import { marked } from 'marked'

import serialize from './serialize';

const withMarkdown = (editor) => {
  editor.md = {
    mdFromFragment(fragment) {
      const nodes = fragment || editor.children;
      return nodes.map((node) => serialize(node)).join('\n');
    },
    fragmentFromMd(md) {
      const html = marked.parse(md);
      return editor.html.fragmentFromHtml(html)
    }
  }
  return editor
}

export default withMarkdown;