import { Pressable, View } from 'react-native'
import classNames from 'classnames'

import CheckIcon from '@/components/CheckIcon'
import { useTheme } from '@/containers/ThemeService'

import { usePickerContext } from './context'

export default function SubmitButton() {
  const { styles } = useTheme()
  const { selected, submit } = usePickerContext()
  const disabled = !selected.length
  return (
    <View
      className="absolute bottom-[56px] w-full flex justify-center items-center"
      pointerEvents={disabled ? 'none' : 'box-none'}>
      <Pressable
        className={classNames(
          'w-[120px] h-[56px] items-center justify-center rounded-full shadow-sm active:opacity-60',
        )}
        style={[styles.btn_success__bg, disabled && { opacity: 0.5 }]}
        onPress={submit}
        disabled={disabled}>
        <CheckIcon color={styles.btn_success__text.color} size={26} />
      </Pressable>
    </View>
  )
}
