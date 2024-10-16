import { ReactNode, useMemo } from 'react'
import { Text, View, ViewStyle } from 'react-native'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import classNames from 'classnames'
import { useField } from 'formik'
import { styled } from 'nativewind'

import { useTheme } from '@/containers/ThemeService'

function SelectField({
  label,
  style,
  name,
  options,
  ...props
}: {
  label: ReactNode | false
  style?: ViewStyle
  name: string
  options: Array<{ label: string; value: string }>
}) {
  const { styles, colorScheme } = useTheme()
  const [field, helpers] = useField(name)

  const labels = useMemo(() => options.map((o) => o.label), [options])

  return (
    <View className="flex flex-row w-full items-center py-3" style={style}>
      {label && (
        <View className="flex-1">
          <Text
            className={classNames('pl-2 pb-[2px]')}
            style={[styles.text, styles.text_xs]}>
            {label}
          </Text>
        </View>
      )}
      <View className="flex-1">
        <SegmentedControl
          values={labels}
          selectedIndex={options.findIndex(
            (item) => item.value === field.value,
          )}
          onChange={(event) => {
            helpers.setValue(
              options[event.nativeEvent.selectedSegmentIndex].value,
            )
          }}
          appearance={colorScheme}
        />
      </View>
    </View>
  )
}
export default styled(SelectField)
