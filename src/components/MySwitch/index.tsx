import { forwardRef } from 'react'
import { Platform, Switch, SwitchProps } from 'react-native'
import Color from 'color'

import { useTheme } from '@/containers/ThemeService'

const MySwitch = forwardRef<Switch, SwitchProps>((props, ref) => {
  const { theme } = useTheme()

  return (
    <Switch
      trackColor={Platform.select({
        ios: {
          true: theme.colors.switch_track || theme.colors.primary,
        },
        android: {
          true:
            theme.colors.switch_track ||
            Color(theme.colors.primary).alpha(0.3).toString(),
        },
      })}
      thumbColor={Platform.select({
        android: props.value
          ? theme.colors.switch_thumb || theme.colors.primary
          : theme.colors.white,
      })}
      {...props}
      ref={ref}
    />
  )
})

MySwitch.displayName = 'MySwitch'

export default MySwitch
