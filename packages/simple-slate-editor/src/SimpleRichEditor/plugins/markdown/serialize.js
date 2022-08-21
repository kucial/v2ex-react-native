import escapeHtml from 'escape-html'
import { Text, Node } from 'slate'

const styleWrapper = {
  code: (val) => '`' + val + '`',
  bold: (val) => `**${val}**`,
  italic: (val) => `_${val}_`,
  underline: (val) => `__${val}__`,
  strikethrough: (val) => `~${val}~`,
}

const STYLE_ORDER = ['code', 'bold', 'underline', 'italic', 'strikethrough']

const wrapWithStyleSyntax = (node) => {
  let output = escapeHtml(node.text);
  STYLE_ORDER.forEach((mark) => {
    if (node[mark]) {
      output = styleWrapper[mark]?.(output) || output;
    }
  });
  return output;
}

const inlineText = (nodes, options) => nodes.map((n) => serialize(n, options)).join(' ')

const serializeList = (node, options, depth = 0) => {
  return node.children.map((listItem, index) => {
    return listItem.children.map((n) => {
      switch (n.type) {
        case 'ordered-list':
        case 'unordered-list':
          return serializeList(n, options, depth + 1);
        default:
          const indent = new Array(depth * 4).fill(' ').join('');
          const prefix = node.type === 'ordered-list' ? `${index + 1}. ` : '- ';
          return `${indent}${prefix}${inlineText(n.children)}`
      }
    }).join('\n');
  }).join('\n');
}

const serialize = (node, options) => {
  if (Text.isText(node)) {
    return wrapWithStyleSyntax(node);
  }

  switch (node.type) {
    case 'blockquote':
      return node.children.map((n) => serialize(n, options)).map((text) => `> ${text}`).join('\n');
    case 'image':
      return `![](${node.data.url})\n`;
    case 'ordered-list':
    case 'unordered-list':
      return serializeList(node, options) + '\n';
    case 'horizontal-line':
      return '----------\n';
    case 'heading-one':
      return `# ${Node.string(node)}\n`;
    case 'heading-two':
      return `## ${Node.string(node)}\n`;
    case 'heading-three':
      return `### ${Node.string(node)}\n`;
    case 'heading-four':
      return `#### ${Node.string(node)}\n`;
    case 'heading-five':
      return `#### ${Node.string(node)}\n`;
    default:
      return inlineText(node.children) + '\n';
  }
}

export default serialize;
