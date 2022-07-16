module.exports = {
  root: true,
  extends: ['plugin:react/recommended', 'plugin:react/jsx-runtime'],
  plugins: ['react', 'react-native', 'prettier'],
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
    'react/prop-types': 1
  }
}
