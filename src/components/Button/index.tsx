import { ReactNode, useMemo } from 'react'
import { Pressable, PressableProps, Text, ViewStyle } from 'react-native'
import classNames from 'classnames'
import { styled } from 'nativewind'

import Loader from '@/components/Loader'
import { useTheme } from '@/containers/ThemeService'

function Button(props: {
  loading?: boolean
  disabled?: boolean
  onPress: PressableProps['onPress']
  children?: ReactNode
  label?: string
  style?: ViewStyle
  variant?: 'primary' | 'secondary' | 'input'
  size?: 'md' | 'sm'
}) {
  const { styles } = useTheme()
  const { size = 'md', variant = 'primary' } = props
  const children = useMemo(() => {
    if (props.children) {
      return props.children
    }
    return (
      <Text
        className="text-base"
        style={[
          variant === 'primary' && styles.btn_primary__text,
          variant === 'input' && styles.text,
          variant === 'secondary' && styles.text_primary,
        ]}>
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
      style={[
        variant === 'primary' && styles.btn_primary__bg,
        variant === 'input' && styles.input__bg,
        variant === 'secondary' && styles.layer2,
        props.style,
      ]}
      onPress={props.onPress}>
      {props.loading ? (
        <Loader size={20} color={styles.btn_primary__text.color as string} />
      ) : (
        children
      )}
    </Pressable>
  )
}

export default styled(Button)
