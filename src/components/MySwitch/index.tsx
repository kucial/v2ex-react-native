import { forwardRef } from 'react'
import { Switch, SwitchProps } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

const MySwitch = forwardRef<Switch, SwitchProps>((props, ref) => {
  const { theme } = useTheme()

  return (
    <Switch
      trackColor={{
        true: theme.colors.primary,
      }}
      {...props}
      ref={ref}
    />
  )
})

MySwitch.displayName = 'MySwitch'

export default MySwitch
