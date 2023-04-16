import { ReactNode, useMemo } from 'react'
import { Pressable, PressableProps, Text, ViewStyle } from 'react-native'
import classNames from 'classnames'
import { styled } from 'nativewind'

import Loader from '@/components/Loader'
import { useTheme } from '@/containers/ThemeService'
import { ThemeStyles } from '@/containers/ThemeService/types'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'input'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

const getBtnStyle = (styles: ThemeStyles, variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return [styles.btn_primary__bg, styles.btn_primary__text]
    case 'input':
      return [styles.input__bg, styles.text]
    case 'secondary':
      return [styles.layer2, styles.text_primary]
    case 'success':
      return [styles.btn_success__bg, styles.btn_success__text]
    case 'danger':
      return [styles.btn_danger__bg, styles.btn_danger__text]
    case 'info':
      return [styles.btn_info__bg, styles.btn_info__text]
    case 'warning':
      return [styles.btn_warning__bg, styles.btn_warning__text]
    default:
      return []
  }
}

function Button(props: {
  loading?: boolean
  disabled?: boolean
  onPress: PressableProps['onPress']
  children?: ReactNode
  label?: string
  style?: ViewStyle
  variant?: ButtonVariant
  size?: 'md' | 'sm'
}) {
  const { styles } = useTheme()
  const { size = 'md', variant = 'primary' } = props

  const [bgStyle, textStyle] = getBtnStyle(styles, variant)

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

  return (
    <Pressable
      disabled={props.loading || props.disabled}
      className={classNames(
        'rounded-md flex items-center justify-center',
        'active:opacity-60',
        size === 'md' && 'h-[44] px-3',
        size === 'sm' && 'h-[36]',
        {
          'opacity-60': props.loading || props.disabled,
        },
      )}
      style={[bgStyle, props.style]}
      onPress={props.onPress}>
      {props.loading ? (
        <Loader size={20} color={textStyle.color as string} />
      ) : (
        children
      )}
    </Pressable>
  )
}

export default styled(Button)
