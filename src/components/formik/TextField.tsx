import { ReactNode } from 'react'
import {
  Platform,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native'
import { BottomSheetTextInput } from '@gorhom/bottom-sheet'
import classNames from 'classnames'
import { useField } from 'formik'
import { styled } from 'nativewind'

import { useTheme } from '@/containers/ThemeService'

import MyClearButton from '../MyClearButton'

function TextField({
  label,
  style,
  inputStyle,
  name,
  bottomSheet,
  canClear,
  ...props
}: {
  label: ReactNode | false
  inputStyle?: ViewStyle
  name: string
  bottomSheet?: boolean
  canClear?: boolean
} & TextInputProps) {
  const { styles, theme } = useTheme()
  const [field, meta, helpers] = useField(name)

  const Component = bottomSheet
    ? Platform.OS === 'android'
      ? TextInput
      : BottomSheetTextInput
    : TextInput
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
      <View className="relative">
        <Component
          className={classNames(
            'px-2 rounded-md text-base',
            Platform.select({
              android: 'min-h-[44px] align-top py-2',
              ios: 'min-h-[44px] py-2',
            }),
          )}
          style={[
            styles.text,
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
          <View className="absolute right-0 h-full flex flex-row items-center justify-center">
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

export default styled(TextField)
