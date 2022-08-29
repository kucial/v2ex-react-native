import escapeHtml from 'escape-html';
import { Text } from 'slate';
import { kebabCase } from 'lodash';

const tagsExtracter = {
  // mark
  bold: () => [{ tag: 'strong' }],
  italic: () => [{ tag: 'em' }],
  underline: () => [{ tag: 'u' }],
  code: () => [{ tag: 'code' }],
  strikethrough: () => [{ tag: 'del' }],
  text: (node, mark) => [
    {
      tag: 'span',
      attrs: {
        'data-slate-mark': mark,
      },
    },
  ],
  // block
  'heading-one': () => [{ tag: 'h1' }],
  'heading-two': () => [{ tag: 'h2' }],
  'heading-three': () => [{ tag: 'h3' }],
  'heading-four': () => [{ tag: 'h4' }],
  'heading-five': () => [{ tag: 'h5' }],
  'heading-six': () => [{ tag: 'h6' }],
  paragraph: () => [{ tag: 'p' }],
  element: (node, options) => {
    const { type, children, ...attrs } = node;
    const mapped = {
      'data-element-type': type,
    };
    Object.entries(attrs).forEach((key, value) => {
      mapped[kebabCase(`data-${key}`)] = value;
    });


    return [
      {
        tag: options.isBlock(node) ? 'div' : 'span',
        attrs: mapped,
      },
    ];
  },
};

// outer first, inner next
const STYLE_ORDER = ['code', 'bold', 'underline', 'italic', 'strikethrough'];

// options: { tagsExtractor, styleOrder }
const tagsFromText = (node, options) => {
  const { styleOrder = STYLE_ORDER } = options;
  const tags = [];
  styleOrder.forEach((mark) => {
    if (node[mark]) {
      const extracter =
        options.tagsExtracter[mark] || options.tagsExtracter.text;
      tags.push(extracter(node, mark));
    }
  });
  return tags.flat();
};

// options: { tagsExtractor }
const tagsFromElement = (node, options) => {
  const extracter =
    options.tagsExtracter[node.type] || options.tagsExtracter.element;
  const tags = extracter(node, options);
  if (options.getCommonExtra) {
    const extraAttrs = options.getCommonExtra(node);
    if (extraAttrs) {
      tags[0].attrs = {
        ...tags[0].attrs,
        ...extraAttrs,
      };
    }
  }
  return tags;
};

export const defaultOptions = {
  styleOrder: STYLE_ORDER,
  tagsExtracter,
  isBlock: () => true,
};

const serialize = (node, options = defaultOptions) => {
  let tags;
  if (Text.isText(node)) {
    tags = tagsFromText(node, options);
  } else {
    tags = tagsFromElement(node, options);
  }

  const children = Text.isText(node)
    ? escapeHtml(node.text)
    : node.children.map((n) => serialize(n, options)).join('');

  return tags.reduceRight((child, tagDesc) => {
    const { tag, attrs, selfClose } = tagDesc;
    return [
      `<`,
      tag.toLowerCase(),
      attrs && ' ',
      attrs &&
        Object.entries(attrs)
          .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
          .join(' '),
      selfClose ? ' />' : '>',
      !selfClose && child,
      !selfClose && `</${tag.toLowerCase()}>`,
    ]
      .filter(Boolean)
      .join('');
  }, children);
};

export const defaultParser = (html) => {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  return parsed;
};

export default serialize;
