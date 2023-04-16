import { TextStyle, ViewStyle } from 'react-native'

export type AlertType = 'info' | 'warn' | 'error' | 'custom' | 'success'

type AlertInstance = {
  id: string
  manager: {
    update(...args: any[]): void
    destroy(...args: any[]): void
  }
}
export type AlertService = {
  alertWithType(params: {
    type: AlertType
    message: string
    containerStyle?: ViewStyle
    textStyle?: TextStyle
    duration?: number
    onPress?(): void
  }): AlertInstance
}
