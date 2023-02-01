module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: [
    '@typescript-eslint',
    'react',
    'react-native',
    'jest',
    'prettier',
    'simple-import-sort',
    'unused-imports',
  ],
  settings: { react: { version: 'detect' } },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  env: {
    'react-native/react-native': true,
    browser: true,
    'jest/globals': true,
  },
  rules: {
    'prettier/prettier': 'error',
    'react/prop-types': 1,
    'simple-import-sort/imports': [
      'warn',
      {
        groups: [
          ['^\\u0000'],
          [
            '^(assert|constants|crypto|events|fs|path|querystring|stream|url)(/.*|$)',
          ],
          ['^(react|solid|vite)', '^@?\\w'],
          ['^(@)(/.*|$)'],
          ['^\\.'],
        ],
      },
    ],
  },
}
