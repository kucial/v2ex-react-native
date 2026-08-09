import { StyleSheet } from 'react-native'

import V2exIcon from '@/components/icons/V2exIcon'

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
      accessibilityLabel='清除内容'
    >
      <V2exIcon name='x-mark-outline' size={18} color={theme.colors.text} />
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
