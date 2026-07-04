import { ReactNode } from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'

import { CONTENT_CONTAINER_MAX_WIDTH } from '@/constants'

export default function MaxWidthWrapper(props: {
  children: ReactNode
  style?: ViewStyle | ViewStyle[]
  className?: string
}) {
  return (
    <View style={[styles.wrapper, props.style]}>
      <View style={styles.inner}>{props.children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  inner: {
    maxWidth: CONTENT_CONTAINER_MAX_WIDTH,
    flex: 1,
  },
})
