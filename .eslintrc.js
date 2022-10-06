module.exports = {
  root: true,
  extends: ['plugin:react/recommended', 'plugin:react/jsx-runtime'],
  plugins: ['react', 'react-native', 'prettier', 'simple-import-sort'],
  settings: { react: { version: 'detect' } },
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  env: {
    'react-native/react-native': true,
    browser: true
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
            '^(assert|constants|crypto|events|fs|path|querystring|stream|url)(/.*|$)'
          ],
          ['^(react|solid|vite)', '^@?\\w'],
          ['^(@)(/.*|$)'],
          ['^\\.']
        ]
      }
    ]
  }
}
