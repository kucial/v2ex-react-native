import { ReactNode, useMemo } from 'react'
import { Platform, PressableProps, Text } from 'react-native'
import { PlatformPressable } from '@react-navigation/elements'
import classNames from 'classnames'
import { styled } from 'nativewind'

import Loader from '@/components/Loader'
import { useTheme } from '@/containers/ThemeService'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'input'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'icon'
  | 'default'

export const StyledPressable = styled(PlatformPressable)

const radiusMap = {
  md: 'rounded-md',
  sm: 'rounded-sm',
  full: 'rounded-full',
}
const radiusNum = {
  md: 6,
  sm: 4,
  full: 9999,
}

function Button(props: {
  loading?: boolean
  disabled?: boolean
  onPress: PressableProps['onPress']
  children?: ReactNode
  label?: string
  style?: PressableProps['style']
  variant?: ButtonVariant
  size?: 'md' | 'sm'
  className?: string
  radius?: number | 'md' | 'sm' | 'full'
}) {
  const { styles, theme, getSemanticStyle } = useTheme()
  const { size, variant, radius = 'md' } = props

  const [bgStyle, textStyle, bdStyle] = getSemanticStyle(variant)

  const children = useMemo(() => {
    if (props.children) {
      return props.children
    }
    return (
      <Text className="text-base" style={textStyle}>
        {props.label}
      </Text>
    )
  }, [props.children, props.label, styles, variant])

  const android_ripple = useMemo(() => {
    return {
      color: theme.colors.bg_layer3,
      radius:
        typeof props.radius === 'string'
          ? radiusNum[props.radius]
          : props.radius,
    }
  }, [props.radius])

  return (
    <StyledPressable
      disabled={props.loading || props.disabled}
      className={classNames(
        'flex items-center justify-center',
        Platform.OS === 'ios' && 'active:opacity-60',
        Platform.OS === 'ios' &&
          variant == 'icon' &&
          'active:bg-neutral-100 dark:active:bg-neutral-600',
        radiusMap[radius],
        size === 'md' && 'h-[44] px-3',
        size === 'sm' && 'h-[36] px-2',
        props.className,
        {
          'opacity-60': props.loading || props.disabled,
        },
      )}
      style={[bgStyle, bdStyle, props.style]}
      onPress={props.onPress}
      android_ripple={android_ripple}>
      {props.loading ? (
        <Loader size={20} color={textStyle.color as string} />
      ) : (
        children
      )}
    </StyledPressable>
  )
}

export default Button
