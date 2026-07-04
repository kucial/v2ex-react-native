import type { ReactNode } from 'react'
import type { ViewProps, ViewStyle } from 'react-native'
import { StyleSheet, View } from 'react-native'

const GroupWapper = (props: {
  children: ReactNode
  innerStyle?: ViewStyle | ViewStyle[]
  style?: ViewStyle | ViewStyle[]
  pointerEvents?: ViewProps['pointerEvents']
}) => {
  return (
    <View
      style={[groupStyles.outer, props.style]}
      pointerEvents={props.pointerEvents}
    >
      <View style={[groupStyles.inner, props.innerStyle]}>
        {props.children}
      </View>
    </View>
  )
}

const groupStyles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  inner: {
    flex: 1,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
})

export default GroupWapper
