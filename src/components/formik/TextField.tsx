import { ReactNode } from 'react'
import { Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native'
import classNames from 'classnames'
import { useField } from 'formik'
import { styled } from 'nativewind'

import { useTheme } from '@/containers/ThemeService'

function TextField({
  label,
  style,
  inputStyle,
  name,
  ...props
}: {
  label: ReactNode | false
  inputStyle?: ViewStyle
  name: string
} & TextInputProps) {
  const { styles, theme } = useTheme()
  const [field, meta, helpers] = useField(name)
  return (
    <View style={style}>
      {label !== false && (
        <View className="flex flex-row">
          <Text
            className={classNames('text-xs pl-2 pb-[2px]', {
              'opacity-0': !field.value,
            })}
            style={styles.text}>
            {label}
          </Text>

          {field.value && meta.touched && (
            <Text className="text-xs ml-2" style={styles.text_danger}>
              {meta.error}
            </Text>
          )}
        </View>
      )}
      <TextInput
        className="h-[44px] px-2 py-3 rounded-md"
        style={[styles.text, styles.input__bg, inputStyle]}
        selectionColor={theme.colors.primary}
        placeholderTextColor={theme.colors.text_placeholder}
        {...props}
        value={field.value}
        onChangeText={helpers.setValue}
        onBlur={() => {
          helpers.setTouched(true)
        }}
      />
    </View>
  )
}

export default styled(TextField)