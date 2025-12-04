import { ReactNode, useMemo } from 'react'
import { Text, View, ViewStyle } from 'react-native'
import SegmentedControl from '@react-native-segmented-control/segmented-control'
import { useField } from 'formik'

import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'

function SelectField({
  label,
  className,
  name,
  options,
  ...props
}: {
  label: ReactNode | false
  className?: string
  name: string
  options: { label: string; value: string }[]
}) {
  const { styles, colorScheme } = useTheme()
  const [field, meta, helpers] = useField(name)

  const labels = useMemo(() => options.map((o) => o.label), [options])

  return (
    <View className={cn('flex flex-row w-full items-center py-3', className)}>
      {label && (
        <View className='flex-1'>
          <Text
            className={cn('pl-2 pb-[2px]')}
            style={[styles.text, styles.text_xs]}
          >
            {label}
          </Text>
        </View>
      )}
      <View className='flex-1'>
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
export default SelectField
