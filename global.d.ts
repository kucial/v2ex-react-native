/// <reference types="nativewind/types" />

import { ColorValue } from 'react-native'

declare global {
  type UrlString = string
  type HTMLString = string

  type IconProps = {
    size?: number
    color?: string | ColorValue
    style?: ViewProps
  }
}

declare module 'react-native' {
  interface TextProps {
    url?: string
  }
}

declare module 'react-native-render-html' {}

export {}
