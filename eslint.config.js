// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const simpleImportSort = require('eslint-plugin-simple-import-sort')
const prettierConfig = require('eslint-config-prettier')
const prettierPlugin = require('eslint-plugin-prettier')

module.exports = defineConfig([
  expoConfig,

  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            ['^\\u0000'], // Side-effect imports
            [
              '^(assert|constants|crypto|events|fs|path|querystring|stream|url)(/.*|$)', // Node.js built-in modules
            ],
            ['^(react|solid|vite)', '^@?\\w'], // Framework and library imports
            [
              '^@\\/components\\/ui(.*)',
              '^@\\/components\\/common(.*)',
              '^@\\/components\\/(.*)',
            ], // Custom component imports
            ['^(@)(/.*|$)'], // Other aliased imports
            ['^\\.'], // Relative imports
          ],
        },
      ],
    },
    ignores: ['dist/*', 'packages/*'],
  },
  prettierConfig,
])
