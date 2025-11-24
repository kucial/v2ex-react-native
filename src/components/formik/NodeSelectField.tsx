import { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { useField } from 'formik'

import NodeSelect from '@/components/NodeSelect'

import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'
import { NodeDetail } from '@/utils/v2ex-client/types'

function NodeSelectField({
  name,
  label,
  placeholder,
  className,
  canClear,
  renderLabel,
}: {
  name: string
  label: ReactNode | false
  placeholder: string
  className?: string
  canClear?: boolean
  renderLabel?: (node: NodeDetail) => ReactNode
}) {
  const { styles } = useTheme()
  const [field, meta, helpers] = useField(name)

  return (
    <View className={className}>
      {label !== false && (
        <View className='flex flex-row'>
          <View className='flex-1'>
            <Text
              className={cn('pl-2 pb-[2px]', {
                'opacity-0': !field.value,
              })}
              style={[styles.text, styles.text_xs]}
            >
              {label}
            </Text>
          </View>

          {meta.error && meta.touched && (
            <Text className='ml-2' style={[styles.text_danger, styles.text_xs]}>
              {meta.error}
            </Text>
          )}
        </View>
      )}
      <NodeSelect
        canClear={canClear}
        value={field.value}
        onChange={helpers.setValue}
        onBlur={() => {
          helpers.setTouched(true)
        }}
        placeholder={placeholder}
        renderLabel={renderLabel}
      />
    </View>
  )
}

export default NodeSelectField
