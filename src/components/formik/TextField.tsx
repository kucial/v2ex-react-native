import { ReactNode } from 'react'
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
import { useField } from 'formik'

import { useTheme } from '@/containers/ThemeService'

import MyClearButton from '../MyClearButton'

function TextField({
  label,
  style,
  inputStyle,
  name,
  canClear,
  ...props
}: {
  label: ReactNode | false
  inputStyle?: StyleProp<TextStyle>
  name: string
  style?: StyleProp<ViewStyle>
  bottomSheet?: boolean
  canClear?: boolean
} & TextInputProps) {
  const { styles, theme } = useTheme()
  const [field, meta, helpers] = useField(name)

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

          {field.value && meta.touched && (
            <Text
              style={[
                textFieldStyles.errorText,
                styles.text_danger,
                styles.text_xs,
              ]}
            >
              {meta.error}
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
          selectionColor={theme.colors.primary}
          placeholderTextColor={theme.colors.text_placeholder}
          {...props}
          value={field.value}
          onChangeText={helpers.setValue}
          onBlur={() => {
            helpers.setTouched(true)
          }}
        />
        {canClear && field.value && (
          <View style={textFieldStyles.clearWrap}>
            <MyClearButton
              onPress={() => {
                helpers.setValue(undefined)
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
