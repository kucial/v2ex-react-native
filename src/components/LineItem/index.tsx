import {
  Pressable,
  Text,
  View,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native'
import classNames from 'classnames'
import { ReactElement, ReactNode } from 'react'

import { useTheme } from '@/containers/ThemeService'

export const LineItemGroup = (props: {
  style?: ViewStyle
  children: ReactNode
}) => {
  return (
    <View
      className="mx-4 my-3 overflow-hidden rounded-lg shadow-xs"
      style={props.style}>
      {props.children}
    </View>
  )
}

export const LineItem = (props: {
  onPress?: (e: GestureResponderEvent) => void
  disabled?: boolean
  isLast?: boolean
  icon?: ReactElement
  title: string
  extra?: ReactElement
}) => {
  const { styles } = useTheme()
  return (
    <Pressable
      className={classNames(
        'min-h-[50px] flex flex-row items-center pl-4',
        'active:opacity-50',
      )}
      style={styles.layer1}
      onPress={props.onPress}
      disabled={props.disabled}>
      <View
        className={classNames('h-full flex-1 flex flex-row')}
        style={!props.isLast && styles.border_b}>
        <View className="flex-1 flex flex-row items-center">
          {props.icon && <View className="mr-3">{props.icon}</View>}
          <Text className="text-base" style={styles.text}>
            {props.title}
          </Text>
        </View>
        {props.extra && (
          <View className="h-full flex flex-row items-center pr-3">
            {props.extra}
          </View>
        )}
      </View>
    </Pressable>
  )
}
