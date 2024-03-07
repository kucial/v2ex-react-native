import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline'
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'

import Button from '@/components/Button'
import { useTheme } from '@/containers/ThemeService'

export default function TopBottomNav(props: {
  onNavTo: (target: number) => void
  isScrollingDown?: boolean
  repliesCount?: number
  scrollDirection?: SharedValue<'up' | 'down' | ''>
}) {
  const { repliesCount, scrollDirection } = props
  const { styles } = useTheme()

  const style = useAnimatedStyle(() => {
    if (scrollDirection.value === 'down') {
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
          bottom: 90,
          display: 'flex',
          flexDirection: 'row',
        },
        style,
      ]}>
      <Button
        variant="default"
        style={{ width: 40, height: 40, marginRight: 6 }}
        onPress={() => {
          props.onNavTo(0)
        }}>
        <ChevronUpIcon size={20} color={styles.text_desc.color} />
      </Button>
      <Button
        variant="default"
        style={{ width: 40, height: 40 }}
        onPress={() => {
          props.onNavTo(props.repliesCount)
        }}>
        <ChevronDownIcon size={20} color={styles.text_desc.color} />
      </Button>
    </Animated.View>
  )
}
