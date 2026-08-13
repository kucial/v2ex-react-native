import { ColorValue, ViewProps } from 'react-native'

declare module '*.png' {
  const value: import('react-native').ImageRequireSource
  export default value
}

declare global {
  type UrlString = string
  type HTMLString = string

  type IconProps = {
    size?: number
    color?: string | ColorValue
    style?: ViewProps
  }
}

declare module 'react-native-render-html' {}

declare module 'react-native/Libraries/Network/RCTNetworking.js' {
  const Networking: {
    clearCookies: (callback: (result: boolean) => void) => void
  }
  export default Networking
}

export {}
