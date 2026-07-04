import { ReactElement, ReactNode } from 'react'
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native'

import { useTheme } from '@/containers/ThemeService'

import FixedPressable from '../FixedPressable'

export const LineItemGroup = (props: {
  style?: ViewStyle | ViewStyle[]
  children: ReactNode
}) => {
  return (
    <View style={[lineItemStyles.groupOuter, props.style]}>
      <View style={lineItemStyles.groupInner}>{props.children}</View>
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
  style?: ViewStyle | ViewStyle[]
}) => {
  const { styles } = useTheme()
  return (
    <FixedPressable
      style={[lineItemStyles.pressable, styles.layer1, props.style]}
      onPress={props.onPress}
      disabled={props.disabled}
    >
      <View
        style={[lineItemStyles.contentRow, !props.isLast && styles.border_b]}
      >
        <View style={lineItemStyles.leftRow}>
          {props.icon && (
            <View style={lineItemStyles.iconWrap}>{props.icon}</View>
          )}
          <Text style={[styles.text, styles.text_base]}>{props.title}</Text>
        </View>
        {props.extra && (
          <View style={lineItemStyles.extraWrap}>{props.extra}</View>
        )}
      </View>
    </FixedPressable>
  )
}

const lineItemStyles = StyleSheet.create({
  groupOuter: {
    flex: 1,
  },
  groupInner: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pressable: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  contentRow: {
    height: '100%',
    flex: 1,
    flexDirection: 'row',
  },
  leftRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    marginRight: 8,
  },
  extraWrap: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
})
