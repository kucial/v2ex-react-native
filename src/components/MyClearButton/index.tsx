import { StyleSheet } from 'react-native'
import { XMarkIcon } from 'react-native-heroicons/outline'

import { useTheme } from '@/containers/ThemeService'

import Button from '../Button'

export default function MyClearButton(props: { onPress: () => void }) {
  const { theme } = useTheme()
  return (
    <Button
      style={clearBtnStyles.btn}
      variant='icon'
      radius={20}
      onPress={props.onPress}
    >
      <XMarkIcon size={18} color={theme.colors.text} />
    </Button>
  )
}

const clearBtnStyles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
})
