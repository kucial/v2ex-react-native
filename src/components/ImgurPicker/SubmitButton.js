import { View } from 'react-native'
import { Pressable } from 'react-native'
import classNames from 'classnames'

import CheckIcon from '@/components/CheckIcon'
import { useTheme } from '@/containers/ThemeService'

export default function SubmitButton(props) {
  const { theme, styles } = useTheme()
  return (
    <View className="absolute bottom-[56px] right-[24px]">
      <Pressable
        className={classNames(
          'w-[62px] h-[62px] items-center justify-center rounded-full shadow-sm active:opacity-60',
        )}
        style={[styles.btn_primary.bg, props.disabled && { opacity: 0.5 }]}
        onPress={props.onPress}
        disabled={props.disabled}>
        <CheckIcon color={theme.colors.text_primary_inverse} size={22} />
      </Pressable>
    </View>
  )
}
