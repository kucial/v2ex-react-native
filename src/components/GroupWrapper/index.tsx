import type { ReactNode } from 'react'
import type { ViewStyle } from 'react-native'
import { View } from 'react-native'
import { styled } from 'nativewind'

const GroupWapper = styled(
  (props: {
    style?: ViewStyle | ViewStyle[]
    children: ReactNode
    innerStyle?: ViewStyle | ViewStyle[]
  }) => {
    return (
      <View
        className="flex-1"
        style={[
          props.style,
          // styles.shadow_light
        ]}>
        <View
          className="flex-1 w-full rounded-lg overflow-hidden"
          style={props.innerStyle}>
          {props.children}
        </View>
      </View>
    )
  },
)

export default GroupWapper
