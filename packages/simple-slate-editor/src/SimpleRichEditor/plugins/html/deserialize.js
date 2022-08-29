import { jsx } from 'slate-hyperscript';

const ELEMENT_TAGS = {
  H1: () => ({ type: 'heading-one' }),
  H2: () => ({ type: 'heading-two' }),
  H3: () => ({ type: 'heading-three' }),
  H4: () => ({ type: 'heading-four' }),
  H5: () => ({ type: 'heading-five' }),
  H6: () => ({ type: 'heading-six' }),
  P: () => ({ type: 'paragraph' }),
};

const TEXT_TAGS = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
};

const elAttrsFromEl = (el, contextName) => {
  if (ELEMENT_TAGS[contextName]) {
    return ELEMENT_TAGS[contextName](el);
  }
  if (el.nodeName === 'DIV' && el.dataSet.elementType) {
    return { type: el.dataSet.elementType}
  }
  return null;
};

const markAttrsFromEl = (el, nodeName) => {
  if (TEXT_TAGS[nodeName]) {
    return TEXT_TAGS[nodeName](nodeName);
  }
  return null;
};

export const defaultOptions = {
  elAttrsFromEl,
  markAttrsFromEl,
  normalize: (n, el) => n,
};

const deserialize = (el, options = defaultOptions) => {
  if (el.nodeType === 3) {
    if (!el.textContent.trim()) {
      return null;
    }
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === 'BR') {
    return '\n';
  }

  let { nodeName: contextName } = el;
  let parent = el;

  // TODO: more general deserialize

  if (
    contextName === 'PRE' &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === 'CODE'
  ) {
    parent = el.childNodes[0];
    contextName = 'CODE_BLOCK';
  }
  let children = Array.from(parent.childNodes)
    .map((n) => deserialize(n, options))
    .flat();

  if (children.length === 0) {
    children = [{ text: '' }];
  }

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children);
  }

  const elAttrs = options.elAttrsFromEl(el, contextName);
  if (elAttrs) {
    const node = jsx('element', elAttrs, children);
    if (options.normalize) {
      return options.normalize(node, el);
    }
    return node;
  }
  const markAttrs = options.markAttrsFromEl(el, contextName);
  if (markAttrs) {
    return children.map((child) => jsx('text', markAttrs, child));
  }

  return children;
};

export default deserialize;
