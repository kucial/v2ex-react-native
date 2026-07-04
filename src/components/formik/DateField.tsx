import { ReactNode, useState } from 'react'
import { StyleSheet, Text, TextInputProps, View, ViewStyle } from 'react-native'
import DatePicker from 'react-native-date-picker'
import { useField } from 'formik'
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
  ...props
}: {
  label: ReactNode | false
  inputStyle?: ViewStyle
  name: string
  pickerMode: PickerMode
  canClear?: boolean
  minDate?: Date
  maxDate?: Date
  pickerTitle?: string
} & TextInputProps) {
  const { styles, theme } = useTheme()
  const [field, meta, helpers] = useField(name)
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

          {field.value && meta.touched && (
            <Text
              style={[
                formFieldStyles.errorText,
                styles.text_danger,
                styles.text_xs,
              ]}
            >
              {meta.error}
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
                helpers.setValue(undefined)
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
          helpers.setValue(date)
        }}
        onCancel={() => {
          setOpen(false)
        }}
        tintColor={theme.colors.primary}
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
