import { Pressable, StyleSheet, View } from 'react-native'

import CheckIcon from '@/components/CheckIcon'

import { useTheme } from '@/containers/ThemeService'

import { usePickerContext } from './context'

export default function SubmitButton() {
  const { styles } = useTheme()
  const { selected, submit } = usePickerContext()
  const disabled = !selected.length
  return (
    <View
      style={submitStyles.container}
      pointerEvents={disabled ? 'none' : 'box-none'}
    >
      <Pressable
        style={({ pressed }) => [
          submitStyles.button,
          styles.btn_success__bg,
          disabled && submitStyles.disabled,
          pressed && submitStyles.pressed,
        ]}
        onPress={submit}
        disabled={disabled}
      >
        <CheckIcon color={styles.btn_success__text.color} size={26} />
      </Pressable>
    </View>
  )
}

const submitStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 56,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 120,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.6,
  },
})
