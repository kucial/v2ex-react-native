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
  variant?: 'primary' | 'secondary'
  size?: 'md' | 'sm'
}) {
  const { styles } = useTheme()
  const { size = 'md' } = props
  const children = useMemo(() => {
    if (props.children) {
      return props.children
    }
    return (
      <Text className="text-base" style={styles.btn_primary__text}>
        {props.label}
      </Text>
    )
  }, [props.children, props.label, styles.btn_primary__text])

  return (
    <Pressable
      disabled={props.loading || props.disabled}
      className={classNames(
        'rounded-md flex items-center justify-center',
        'active:opacity-60',
        size === 'md' && 'h-[44] px-4',
        size === 'sm' && 'h-[36]',
        {
          'opacity-60': props.loading || props.disabled,
        },
      )}
      style={[styles.btn_primary__bg, props.style]}
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
