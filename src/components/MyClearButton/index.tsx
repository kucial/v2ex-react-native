import { XMarkIcon } from 'react-native-heroicons/outline'

import { useTheme } from '@/containers/ThemeService'

import Button from '../Button'

export default function MyClearButton(props: { onPress: () => void }) {
  const { theme } = useTheme()
  return (
    <Button
      className="rounded-full w-[40px] h-[40px]"
      variant="icon"
      radius={20}
      onPress={props.onPress}>
      <XMarkIcon size={18} color={theme.colors.text} />
    </Button>
  )
}
