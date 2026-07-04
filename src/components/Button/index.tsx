import { ReactNode, useMemo } from 'react'
import {
  Platform,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
} from 'react-native'
import Color from 'color'

import Loader from '@/components/Loader'

import { getSemanticStyle, useTheme } from '@/containers/ThemeService'

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
  radius?: number | 'md' | 'sm' | 'full'
}) {
  const { styles, theme } = useTheme()
  const { size, variant, radius = 'md' } = props

  const {
    container: containerStyle,
    text: textStyle,
    border: borderStyle,
  } = getSemanticStyle(variant, styles)

  const children = useMemo(() => {
    if (props.children) {
      return props.children
    }
    return <Text style={[styles.text_base, textStyle]}>{props.label}</Text>
  }, [props.children, props.label, styles, textStyle])

  const android_ripple = useMemo(() => {
    return {
      color: Color(theme.colors.text).alpha(0.08).toString(),
      radius:
        typeof props.radius === 'string'
          ? radiusNum[props.radius]
          : props.radius,
    }
  }, [props.radius, theme.colors.text])

  return (
    <Pressable
      disabled={props.disabled}
      style={({ pressed }) => [
        btnStyles.base,
        {
          borderRadius: typeof radius === 'string' ? radiusNum[radius] : radius,
        },
        size === 'md' && btnStyles.sizeMd,
        size === 'sm' && btnStyles.sizeSm,
        (props.loading || props.disabled) && btnStyles.disabled,
        containerStyle,
        borderStyle,
        pressed && [
          btnStyles.pressed,
          Platform.OS === 'ios' &&
            variant === 'icon' && {
              backgroundColor: theme.colors.bg_overlay,
            },
        ],
        typeof props.style === 'function'
          ? props.style({ pressed })
          : props.style,
      ]}
      onPress={props.onPress}
      android_ripple={android_ripple}
    >
      {props.loading ? (
        <Loader size={20} color={textStyle.color as string} />
      ) : (
        children
      )}
    </Pressable>
  )
}

const btnStyles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeMd: {
    height: 44,
    paddingHorizontal: 12,
  },
  sizeSm: {
    height: 36,
    paddingHorizontal: 8,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.6,
  },
})

export default Button
