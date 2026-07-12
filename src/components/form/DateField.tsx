import { ReactNode, useState } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'
import DatePicker from 'react-native-date-picker'
import { padStart } from 'lodash'

import { useTheme } from '@/containers/ThemeService'

import Button from '../Button'
import MyClearButton from '../MyClearButton'

type PickerMode = 'datetime' | 'date' | 'time'
const formatDate = (date: Date, mode: PickerMode) => {
  switch (mode) {
    case 'date':
      return `${date.getFullYear()}-${padStart(
        `${date.getMonth() + 1}`,
        2,
        '0',
      )}-${date.getDate()}`
    case 'datetime':
      return date.toISOString()
    case 'time':
      return `${date.getTime()}`
  }
}

function DateField({
  label,
  style,
  name,
  canClear,
  control,
  ...props
}: Omit<TextInputProps, 'style'> & {
  label: ReactNode | false
  inputStyle?: StyleProp<TextStyle>
  name: string
  style?: StyleProp<ViewStyle>
  pickerMode: PickerMode
  canClear?: boolean
  minDate?: Date
  maxDate?: Date
  pickerTitle?: string
  control?: any
}) {
  const { styles, theme } = useTheme()
  const formContext = useFormContext()
  const { field, fieldState } = useController({
    name,
    control: control || formContext?.control,
  })
  const [open, setOpen] = useState(false)

  return (
    <View style={style}>
      {label !== false && (
        <View style={formFieldStyles.labelRow}>
          <Text
            style={[
              formFieldStyles.labelText,
              !field.value && formFieldStyles.opacity0,
              styles.text,
              styles.text_xs,
            ]}
          >
            {label}
          </Text>

          {fieldState.error?.message && (
            <Text
              style={[
                formFieldStyles.errorText,
                styles.text_danger,
                styles.text_xs,
              ]}
            >
              {fieldState.error.message}
            </Text>
          )}
        </View>
      )}
      <View style={formFieldStyles.relative}>
        <Button
          size='md'
          variant='input'
          onPress={() => {
            setOpen(true)
          }}
        >
          <View style={formFieldStyles.wFull}>
            {field.value ? (
              <Text style={[styles.text, styles.text_base]}>
                {formatDate(field.value, props.pickerMode)}
              </Text>
            ) : (
              <Text style={[styles.text_placeholder, styles.text_base]}>
                {props.placeholder}
              </Text>
            )}
          </View>
        </Button>
        {canClear && field.value && (
          <View style={formFieldStyles.clearWrap}>
            <MyClearButton
              onPress={() => {
                field.onChange(undefined)
              }}
            />
          </View>
        )}
      </View>
      <DatePicker
        modal
        open={open}
        theme={theme.dark ? 'dark' : 'light'}
        mode={props.pickerMode}
        minimumDate={props.minDate}
        maximumDate={props.maxDate}
        locale='zh'
        confirmText='确认'
        cancelText='取消'
        title={props.pickerTitle || '选择日期'}
        date={field.value || new Date()}
        onConfirm={(date) => {
          setOpen(false)
          field.onChange(date)
        }}
        onCancel={() => {
          setOpen(false)
        }}
      />
    </View>
  )
}

const formFieldStyles = StyleSheet.create({
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
  wFull: {
    width: '100%',
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

export default DateField
