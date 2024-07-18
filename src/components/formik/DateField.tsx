import { ReactNode, useState } from 'react'
import { Text, TextInputProps, View, ViewStyle } from 'react-native'
import DatePicker from 'react-native-date-picker'
import classNames from 'classnames'
import { useField } from 'formik'
import { padStart } from 'lodash'
import { styled } from 'nativewind'

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
        <View className="flex flex-row">
          <Text
            className={classNames('pl-2 pb-[2px]', {
              'opacity-0': !field.value,
            })}
            style={[styles.text, styles.text_xs]}>
            {label}
          </Text>

          {field.value && meta.touched && (
            <Text className="ml-2" style={[styles.text_danger, styles.text_xs]}>
              {meta.error}
            </Text>
          )}
        </View>
      )}
      <View className="relative">
        <Button
          size="md"
          variant="input"
          onPress={() => {
            setOpen(true)
          }}>
          <View className="w-full">
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
          <View className="absolute right-0 h-full flex flex-row items-center justify-center">
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
        locale="zh"
        confirmText="确认"
        cancelText="取消"
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

export default styled(DateField)
