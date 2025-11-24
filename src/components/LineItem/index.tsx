import { ReactElement, ReactNode } from 'react'
import { GestureResponderEvent, Text, View, ViewStyle } from 'react-native'

import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'

import FixedPressable from '../FixedPressable'

export const LineItemGroup = (props: {
  className?: string
  children: ReactNode
}) => {
  return (
    <View className={cn('flex-1', props.className)}>
      <View className='flex-1 rounded-lg overflow-hidden'>
        {props.children}
      </View>
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
  style?: ViewStyle
  className?: string
}) => {
  const { styles } = useTheme()
  return (
    <FixedPressable
      className={cn(
        'min-h-[50px] flex flex-row items-center pl-4',
        'active:opacity-50',
        props.className,
      )}
      style={[styles.layer1, props.style]}
      onPress={props.onPress}
      disabled={props.disabled}
    >
      <View
        className={cn('h-full flex-1 flex flex-row')}
        style={!props.isLast && styles.border_b}
      >
        <View className='flex-1 flex flex-row items-center'>
          {props.icon && <View className='mr-2'>{props.icon}</View>}
          <Text style={[styles.text, styles.text_base]}>{props.title}</Text>
        </View>
        {props.extra && (
          <View className='h-full flex flex-row items-center pr-3'>
            {props.extra}
          </View>
        )}
      </View>
    </FixedPressable>
  )
}
