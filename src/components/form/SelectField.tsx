import { ReactNode, useMemo } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'
import SegmentedControl from '@react-native-segmented-control/segmented-control'

import { useTheme } from '@/containers/ThemeService'

function SelectField({
  label,
  style,
  name,
  options,
  control,
  ...props
}: {
  label: ReactNode | false
  style?: StyleProp<ViewStyle>
  name: string
  options: { label: string; value: string }[]
  control?: any
}) {
  const { styles, colorScheme } = useTheme()
  const formContext = useFormContext()
  const { field } = useController({
    name,
    control: control || formContext?.control,
  })

  const labels = useMemo(() => options.map((o) => o.label), [options])

  return (
    <View style={[selectFieldStyles.container, style]}>
      {label && (
        <View style={selectFieldStyles.flex1}>
          <Text
            style={[selectFieldStyles.labelText, styles.text, styles.text_xs]}
          >
            {label}
          </Text>
        </View>
      )}
      <View style={selectFieldStyles.flex1}>
        <SegmentedControl
          values={labels}
          selectedIndex={options.findIndex(
            (item) => item.value === field.value,
          )}
          onChange={(event) => {
            field.onChange(
              options[event.nativeEvent.selectedSegmentIndex].value,
            )
          }}
          appearance={colorScheme}
        />
      </View>
    </View>
  )
}

const selectFieldStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  flex1: {
    flex: 1,
  },
  labelText: {
    paddingLeft: 8,
    paddingBottom: 2,
  },
})

export default SelectField
