import type { ReactNode } from 'react'
import type { ViewProps, ViewStyle } from 'react-native'
import { View } from 'react-native'
import { styled } from 'nativewind'

const GroupWapper = styled(
  (props: {
    style?: ViewStyle | ViewStyle[]
    children: ReactNode
    innerStyle?: ViewStyle | ViewStyle[]
    pointerEvents?: ViewProps['pointerEvents']
  }) => {
    return (
      <View
        className="flex-1"
        style={[
          props.style,
          // styles.shadow_light
        ]}
        pointerEvents={props.pointerEvents}>
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
