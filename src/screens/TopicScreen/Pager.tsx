import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import Svg, { Path } from 'react-native-svg'

import { useTheme } from '@/containers/ThemeService'

const ToBottomIcon = (props: { size: number; color: string }) => (
  <Svg viewBox='0 0 18 18' width={props.size} height={props.size}>
    <Path
      strokeWidth={2}
      stroke={props.color}
      d='M9,2.5v13 M9,15.5l6.75-6.75 M9,15.5L2.25,8.75 M1.5,15.5h15'
    />
  </Svg>
)

type PagerProps = {
  max: number
  current?: number
  onSelect(page: number): void
  style?: StyleProp<ViewStyle>
  disabled?: boolean
}

const Pager = (props: PagerProps) => {
  const { styles } = useTheme()
  return (
    <View style={[pagerStyles.container, props.style]}>
      <Pressable
        disabled={props.disabled}
        hitSlop={6}
        style={({ pressed }) => [
          pagerStyles.btn,
          styles.layer2,
          pressed && pagerStyles.pressed,
        ]}
        onPress={() => {
          props.onSelect(Infinity)
        }}
      >
        {/* <Text style={styles.text_desc}>B</Text> */}
        <ToBottomIcon size={16} color={styles.text_meta.color} />
      </Pressable>
    </View>
  )
}

const pagerStyles = StyleSheet.create({
  container: {},
  btn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  pressed: {
    opacity: 0.6,
  },
})

export default Pager
