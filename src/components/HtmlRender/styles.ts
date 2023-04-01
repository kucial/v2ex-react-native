import { MixedStyleDeclaration } from 'react-native-render-html'

function convertCSSToObject(
  css: Record<string, any>,
): Readonly<Record<string, MixedStyleDeclaration>> {
  return Object.fromEntries(
    Object.entries(css).flatMap(([key, val]) =>
      key.split(',').map((o) => [o.trim().slice(1), val]),
    ),
  ) as unknown as Readonly<Record<string, MixedStyleDeclaration>>
}

export const atomOne = {
  light: convertCSSToObject({
    '.hljs': {
      color: '#383a42',
      padding: 4,
      flex: 1,
    },
    '.hljs-comment,.hljs-quote': {
      color: '#a0a1a7',
      fontStyle: 'italic',
    },

    '.hljs-doctag,.hljs-formula,.hljs-keyword': {
      color: '#a626a4',
    },

    '.hljs-deletion,.hljs-name,.hljs-section,.hljs-selector-tag,.hljs-subst': {
      color: '#e45649',
    },

    '.hljs-literal': {
      color: '#0184bb',
    },

    '.hljs-addition,.hljs-attribute,.hljs-meta .hljs-string,.hljs-regexp,.hljs-string':
      {
        color: '#50a14f',
      },

    '.hljs-attr,.hljs-number,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-pseudo,.hljs-template-variable,.hljs-type,.hljs-variable':
      {
        color: '#986801',
      },

    '.hljs-bullet,.hljs-link,.hljs-meta,.hljs-selector-id,.hljs-symbol,.hljs-title':
      {
        color: '#4078f2',
      },

    '.hljs-built_in,.hljs-class .hljs-title,.hljs-title.class_': {
      color: '#c18401',
    },

    '.hljs-emphasis': {
      fontStyle: 'italic',
    },

    '.hljs-strong': {
      fontWeight: 700,
    },

    '.hljs-link': {
      textDecoration: 'underline',
    },
  }),

  dark: convertCSSToObject({
    '.hljs': {
      color: '#abb2bf',
      padding: 4,
    },
    '.hljs-comment,.hljs-quote': {
      color: '#5c6370',
      fontStyle: 'italic',
    },

    '.hljs-doctag,.hljs-formula,.hljs-keyword': {
      color: '#c678dd',
    },

    '.hljs-deletion,.hljs-name,.hljs-section,.hljs-selector-tag,.hljs-subst': {
      color: '#e06c75',
    },

    '.hljs-literal': {
      color: '#56b6c2',
    },

    '.hljs-addition,.hljs-attribute,.hljs-meta .hljs-string,.hljs-regexp,.hljs-string':
      {
        color: '#98c379',
      },

    '.hljs-attr,.hljs-number,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-pseudo,.hljs-template-variable,.hljs-type,.hljs-variable':
      {
        color: '#d19a66',
      },

    '.hljs-bullet,.hljs-link,.hljs-meta,.hljs-selector-id,.hljs-symbol,.hljs-title':
      {
        color: '#61aeee',
      },

    '.hljs-built_in,.hljs-class .hljs-title,.hljs-title.class_': {
      color: '#e6c07b',
    },

    '.hljs-emphasis': {
      fontStyle: 'italic',
    },

    '.hljs-strong': {
      fontWeight: 700,
    },

    '.hljs-link': {
      textDecoration: 'underline',
    },
  }),
}
