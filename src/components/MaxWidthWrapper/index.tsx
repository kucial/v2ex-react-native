import { ReactNode } from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import { styled } from 'nativewind'

import { isPad } from '@/utils/device'

function MaxWidthWrapper(props: { children: ReactNode; style?: ViewStyle }) {
  // if (isPad) {
  return (
    <View style={[styles.wrapper, props.style]}>
      <View style={styles.inner}>{props.children}</View>
    </View>
  )
  // }

  // return <View style={props.style}>{props.children}</View>
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
    maxWidth: 600,
    flex: 1,
  },
})
