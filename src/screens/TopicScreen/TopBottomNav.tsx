import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Button from '@/components/Button'
import V2exIcon from '@/components/icons/V2exIcon'

import { useTheme } from '@/containers/ThemeService'

export default function TopBottomNav(props: {
  onNavTo: (target: number) => void
  isScrollingDown?: boolean
  repliesCount?: number
  scrollDirection?: SharedValue<'up' | 'down' | ''>
}) {
  const { repliesCount, scrollDirection } = props
  const { styles } = useTheme()
  const { bottom } = useSafeAreaInsets()

  const style = useAnimatedStyle(() => {
    if (scrollDirection?.value === 'down') {
      return { opacity: 0.5 }
    }
    return { opacity: 0.9 }
  })

  if (!repliesCount || repliesCount < 10) {
    return null
  }
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          right: 11,
          bottom: bottom + 60,
          display: 'flex',
          flexDirection: 'row',
        },
        style,
      ]}
    >
      <Button
        variant='default'
        style={{ width: 40, height: 40, marginRight: 6 }}
        onPress={() => {
          props.onNavTo(0)
        }}
      >
        <V2exIcon
          name='chevron-up-outline'
          size={20}
          color={styles.text_desc.color}
        />
      </Button>
      <Button
        variant='default'
        style={{ width: 40, height: 40 }}
        onPress={() => {
          props.onNavTo(repliesCount)
        }}
      >
        <V2exIcon
          name='chevron-down-outline'
          size={20}
          color={styles.text_desc.color}
        />
      </Button>
    </Animated.View>
  )
}
