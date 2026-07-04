import { ReactNode } from 'react'
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'
import { useField } from 'formik'

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
}: {
  name: string
  label: ReactNode | false
  placeholder: string
  style?: StyleProp<ViewStyle>
  canClear?: boolean
  renderLabel?: (node: NodeDetail) => ReactNode
}) {
  const { styles } = useTheme()
  const [field, meta, helpers] = useField(name)

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

          {meta.error && meta.touched && (
            <Text
              style={[
                nodeSelectStyles.errorText,
                styles.text_danger,
                styles.text_xs,
              ]}
            >
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
