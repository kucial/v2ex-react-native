import { ReactNode } from 'react'
import { useController, useFormContext } from 'react-hook-form'
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'

import NodeSelect from '@/components/NodeSelect'

import { useTheme } from '@/containers/ThemeService'
import { NodeDetail } from '@/utils/v2ex-client/types'

function NodeSelectField({
  name,
  label,
  placeholder,
  style,
  canClear,
  renderLabel,
  control,
}: {
  name: string
  label: ReactNode | false
  placeholder: string
  style?: StyleProp<ViewStyle>
  canClear?: boolean
  renderLabel?: (node: NodeDetail) => ReactNode
  control?: any
}) {
  const { styles } = useTheme()
  const formContext = useFormContext()
  const { field, fieldState } = useController({
    name,
    control: control || formContext?.control,
  })

  return (
    <View style={style}>
      {label !== false && (
        <View style={nodeSelectStyles.labelRow}>
          <View style={nodeSelectStyles.flex1}>
            <Text
              style={[
                nodeSelectStyles.labelText,
                !field.value && nodeSelectStyles.opacity0,
                styles.text,
                styles.text_xs,
              ]}
            >
              {label}
            </Text>
          </View>

          {fieldState.error?.message && (
            <Text
              style={[
                nodeSelectStyles.errorText,
                styles.text_danger,
                styles.text_xs,
              ]}
            >
              {fieldState.error.message}
            </Text>
          )}
        </View>
      )}
      <NodeSelect
        canClear={canClear}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        placeholder={placeholder}
        renderLabel={renderLabel}
      />
    </View>
  )
}

const nodeSelectStyles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
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
})

export default NodeSelectField
