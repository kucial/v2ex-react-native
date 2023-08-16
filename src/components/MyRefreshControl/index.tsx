import { forwardRef } from 'react'
import { RefreshControl, RefreshControlProps } from 'react-native'
import Color from 'color'

import { useTheme } from '@/containers/ThemeService'

const MyRefreshControl = forwardRef<RefreshControl, RefreshControlProps>(
  (props, ref) => {
    const { theme, colorScheme } = useTheme()

    return (
      <RefreshControl
        key={colorScheme + theme.colors.primary}
        progressBackgroundColor={theme.colors.bg_overlay}
        colors={[theme.colors.primary]}
        tintColor={Color(theme.colors.primary)
          .saturate(0.6)
          .lighten(0.2)
          .alpha(0.8)
          .toString()}
        {...props}
        ref={ref}
      />
    )
  },
)
MyRefreshControl.displayName = 'MyRefreshControl'

export default MyRefreshControl
