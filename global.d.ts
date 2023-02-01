/// <reference types="nativewind/types" />

import { ColorValue } from 'react-native'

declare global {
  type UrlString = string
  type HTMLString = string

  type IconProps = {
    size?: number
    color?: string | ColorValue
  }
}

declare module 'react-native' {
  interface TextProps {
    url?: string
  }
}

declare module 'react-native-render-html' {}

declare module '*.png' {
  const value: import('react-native').ImageSourcePropType
  export default value
}

export {}
