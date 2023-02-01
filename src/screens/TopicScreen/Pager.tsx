import { Pressable, View, ViewStyle } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { styled } from 'nativewind'

import { useTheme } from '@/containers/ThemeService'

const ToBottomIcon = (props: IconProps) => (
  <Svg viewBox="0 0 18 18" width={props.size} height={props.size}>
    <Path
      strokeWidth={2}
      stroke={props.color}
      d="M9,2.5v13 M9,15.5l6.75-6.75 M9,15.5L2.25,8.75 M1.5,15.5h15"
    />
  </Svg>
)

type PagerProps = {
  max: number
  current?: number
  onSelect(page: number): void
  style?: ViewStyle
  disabled?: boolean
}

const Pager = styled((props: PagerProps) => {
  const { styles } = useTheme()
  return (
    <View className="flex" style={props.style}>
      <Pressable
        disabled={props.disabled}
        hitSlop={6}
        className="w-6 h-6 items-center justify-center rounded active:opacity-60"
        style={styles.layer2}
        onPress={() => {
          props.onSelect(Infinity)
        }}>
        {/* <Text style={styles.text_desc}>B</Text> */}
        <ToBottomIcon size={16} color={styles.text_meta.color} />
      </Pressable>
    </View>
  )
})

export default Pager
