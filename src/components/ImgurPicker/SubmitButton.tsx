import { View } from 'react-native'
import { Pressable } from 'react-native'
import classNames from 'classnames'

import CheckIcon from '@/components/CheckIcon'
import { useTheme } from '@/containers/ThemeService'

export default function SubmitButton(props: {
  disabled?: boolean
  onPress(): void
}) {
  const { styles } = useTheme()
  return (
    <View className="absolute bottom-[56px] right-[24px]">
      <Pressable
        className={classNames(
          'w-[62px] h-[62px] items-center justify-center rounded-full shadow-sm active:opacity-60',
        )}
        style={[styles.btn_primary__bg, props.disabled && { opacity: 0.5 }]}
        onPress={props.onPress}
        disabled={props.disabled}>
        <CheckIcon color={styles.btn_primary__text.color} size={22} />
      </Pressable>
    </View>
  )
}
