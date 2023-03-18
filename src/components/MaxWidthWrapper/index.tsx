import { ReactNode } from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import { styled } from 'nativewind'

import { CONTENT_CONTAINER_MAX_WIDTH } from '@/constants'

function MaxWidthWrapper(props: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.wrapper, props.style]}>
      <View style={styles.inner}>{props.children}</View>
    </View>
  )
}

export default styled(MaxWidthWrapper)

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
