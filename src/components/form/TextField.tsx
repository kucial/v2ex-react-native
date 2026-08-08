import { ReactNode } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import {
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'

import { useTheme } from '@/containers/ThemeService'

import MyClearButton from '../MyClearButton'

function TextField({
  label,
  style,
  inputStyle,
  name,
  canClear,
  control,
  ...props
}: {
  label: ReactNode | false
  inputStyle?: StyleProp<TextStyle>
  name: string
  style?: StyleProp<ViewStyle>
  bottomSheet?: boolean
  canClear?: boolean
  control?: any
} & TextInputProps) {
  const { styles, theme } = useTheme()
  const formContext = useFormContext()
  const { field, fieldState } = useController({
    name,
    control: control || formContext?.control,
  })

  const Component = TextInput
  return (
    <View style={style}>
      {label !== false && (
        <View style={textFieldStyles.labelRow}>
          <Text
            style={[
              textFieldStyles.labelText,
              !field.value && textFieldStyles.opacity0,
              styles.text,
              styles.text_xs,
            ]}
          >
            {label}
          </Text>

          {fieldState.error?.message && (
            <Text
              style={[
                textFieldStyles.errorText,
                styles.text_danger,
                styles.text_xs,
              ]}
            >
              {fieldState.error.message}
            </Text>
          )}
        </View>
      )}
      <View style={textFieldStyles.relative}>
        <Component
          style={[
            textFieldStyles.input,
            styles.text,
            styles.text_base,
            styles.input__bg,
            inputStyle,
            !props.multiline && {
              lineHeight: 20,
            },
          ]}
          placeholderTextColor={theme.colors.text_placeholder}
          {...props}
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
        />
        {canClear && field.value && (
          <View style={textFieldStyles.clearWrap}>
            <MyClearButton
              onPress={() => {
                field.onChange(undefined)
              }}
            />
          </View>
        )}
      </View>
    </View>
  )
}

const textFieldStyles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
  },
  labelText: {
    paddingLeft: 8,
    paddingBottom: 2,
  },
  opacity0: {
    opacity: 0,
  },
  errorText: {
    marginLeft: 8,
  },
  relative: {
    position: 'relative',
  },
  input: {
    paddingHorizontal: 8,
    borderRadius: 6,
    minHeight: 44,
    paddingVertical: 8,
    ...Platform.select({
      android: {
        textAlignVertical: 'top',
      },
    }),
  },
  clearWrap: {
    position: 'absolute',
    right: 0,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default TextField
