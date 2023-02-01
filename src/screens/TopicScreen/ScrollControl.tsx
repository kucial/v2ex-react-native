import {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react'
import { Alert, Pressable, Text, View } from 'react-native'

import NumberIcon from '@/components/NumberIcon'
import ToBottomIcon from '@/components/ToBottomIcon'
import { useTheme } from '@/containers/ThemeService'

export type ScrollControlProps = {
  max: number
  onNavTo(index: number): void
}

type Action = 'to_top' | 'to_bottom' | ''

export type ScrollControlApi = {
  setAction(action: Action): void
}

const ScrollControl = forwardRef<ScrollControlApi, ScrollControlProps>(
  (props, ref) => {
    const [action, setAction] = useState<Action>('')
    const { styles } = useTheme()

    const handlePress = useCallback(() => {
      if (!action) {
        Alert.prompt(
          '定位到 # 楼?',
          undefined,
          (val) => {
            const target = Number(val)
            if (target > props.max) {
              return
            }
            props.onNavTo(target)
          },
          undefined,
          undefined,
          'numeric',
        )
        return
      }
      if (action === 'to_top') {
        props.onNavTo(0)
        return
      }
      if (action === 'to_bottom') {
        props.onNavTo(props.max)
        return
      }
    }, [action, props.max])

    useImperativeHandle(
      ref,
      () => ({
        setAction,
      }),
      [],
    )

    return (
      <Pressable
        className="w-[46px] h-[48px] rounded-md items-center justify-center active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
        onPress={handlePress}>
        <View className="my-1">
          {action ? (
            <View
              style={
                action === 'to_top' && {
                  transform: [{ rotate: '180deg' }],
                }
              }>
              <ToBottomIcon size={24} color={styles.text_meta.color} />
            </View>
          ) : (
            <NumberIcon size={24} color={styles.text_meta.color} />
          )}
        </View>
        <Text className="text-[10px]" style={styles.text_meta}>
          {action === 'to_top' && '至顶'}
          {action === 'to_bottom' && '至末'}
          {!action && '定位'}
        </Text>
        {/* <Text className="text-[10px]" style={styles.text_meta}>
        到达底部
      </Text> */}
      </Pressable>
    )
  },
)

ScrollControl.displayName = 'ScrollControl'

export default memo(ScrollControl)
