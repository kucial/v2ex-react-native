import { TextInput } from 'react-native'
import { cssInterop } from 'react-native-css-interop'
import { Image } from 'expo-image'

cssInterop(Image, { className: 'style' })
cssInterop(TextInput, {
  className: {
    target: 'style', // map className->style
    nativeStyleToProp: {
      textAlign: true, // extract `textAlign` styles and pass them to the `textAlign` prop
    },
  },
  placeholderClassName: {
    target: false, // Don't pass this as a prop
    nativeStyleToProp: {
      color: 'placeholderTextColor', // extract `color` and pass it to the `placeholderTextColor`prop
    },
  },
  selectionClassName: {
    target: false, // Don't pass this as a prop
    nativeStyleToProp: {
      color: 'selectionColor', // extract `color` and pass it to the `selectionColor`prop
    },
  },
})
