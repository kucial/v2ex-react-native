import type { ReactNode } from 'react'
import type { ViewStyle } from 'react-native'
import { View } from 'react-native'
import { styled } from 'nativewind'

const GroupWapper = styled(
  (props: { style?: ViewStyle; children: ReactNode }) => {
    return (
      <View
        className="overflow-hidden rounded-lg shadow-xs"
        style={props.style}>
        {props.children}
      </View>
    )
  },
)

export default GroupWapper
