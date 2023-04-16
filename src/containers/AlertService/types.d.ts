import { TextStyle, ViewStyle } from 'react-native'

export type AlertType =
  | 'info'
  | 'warn'
  | 'error'
  | 'custom'
  | 'success'
  | 'default'

type AlertInstance = {
  id: string
  manager: {
    update(...args: any[]): void
    destroy(...args: any[]): void
  }
}
export type AlertService = {
  show(params: {
    type: AlertType
    message: string
    loading?: boolean
    containerStyle?: ViewStyle
    textStyle?: TextStyle
    duration?: number
    onPress?(): void
  }): AlertInstance
  hide(toast: AlertInstance): void
}
