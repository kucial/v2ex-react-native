import { Pressable, View } from 'react-native'
import classNames from 'classnames'

import CheckIcon from '@/components/CheckIcon'
import { useTheme } from '@/containers/ThemeService'

export default function SubmitButton(props: {
  disabled?: boolean
  onPress(): void
}) {
  const { styles } = useTheme()
  return (
    <View
      className="absolute bottom-[56px] w-full flex justify-center items-center"
      pointerEvents={props.disabled ? 'none' : 'box-none'}>
      <Pressable
        className={classNames(
          'w-[120px] h-[56px] items-center justify-center rounded-full shadow-sm active:opacity-60',
        )}
        style={[styles.btn_success__bg, props.disabled && { opacity: 0.5 }]}
        onPress={props.onPress}
        disabled={props.disabled}>
        <CheckIcon color={styles.btn_success__text.color} size={26} />
      </Pressable>
    </View>
  )
}
