import { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { ViewStyle } from 'react-native'
import classNames from 'classnames'
import { useField } from 'formik'
import { styled } from 'nativewind'

import NodeSelect from '@/components/NodeSelect'
import { useTheme } from '@/containers/ThemeService'

function NodeSelectField({
  name,
  label,
  placeholder,
  style,
}: {
  name: string
  label: ReactNode | false
  placeholder: string
  style?: ViewStyle
}) {
  const { styles } = useTheme()
  const [field, meta, helpers] = useField(name)

  return (
    <View style={style}>
      {label !== false && (
        <View className="flex flex-row">
          <View className="flex-1">
            <Text
              className={classNames('text-xs pl-2 pb-[2px]', {
                'opacity-0': !field.value,
              })}
              style={styles.text}>
              {label}
            </Text>
          </View>

          {meta.error && meta.touched && (
            <Text className="text-xs ml-2" style={styles.text_danger}>
              {meta.error}
            </Text>
          )}
        </View>
      )}
      <NodeSelect
        value={field.value}
        onChange={helpers.setValue}
        onBlur={() => {
          helpers.setTouched(true)
        }}
        placeholder={placeholder}
      />
    </View>
  )
}

export default styled(NodeSelectField)
