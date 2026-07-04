import { MutableRefObject, ReactNode, useMemo } from 'react'
import { StyleSheet, Text, View, ViewProps, ViewStyle } from 'react-native'
import { useField } from 'formik'
import { marked } from 'marked'

import { EditorRender } from '@/components/SlateEditor'

import { useTheme } from '@/containers/ThemeService'

function RichTextField({
  label,
  style,
  name,
  placeholder,
  onLayout,
  onCursorPositionUpdate,
  editorRenderContainerRef,
}: {
  label: ReactNode | false
  inputStyle?: ViewStyle
  name: string
  bottomSheet?: boolean
  placeholder: string
  onLayout?: ViewProps['onLayout']
  onCursorPositionUpdate?(): void
  style?: ViewStyle
  editorRenderContainerRef: MutableRefObject<View>
}) {
  const [field, meta] = useField(name)
  const { styles } = useTheme()

  const html = useMemo(() => {
    if (!field.value) {
      return ''
    }
    return marked(field.value)
  }, [field.value])

  return (
    <View style={style}>
      {label !== false && (
        <View style={richFieldStyles.labelRow}>
          <Text
            style={[
              richFieldStyles.labelText,
              !field.value && richFieldStyles.opacity0,
              styles.text,
              styles.text_xs,
            ]}
          >
            {label}
          </Text>

          {field.value && meta.touched && (
            <Text
              style={[
                richFieldStyles.errorText,
                styles.text_danger,
                styles.text_xs,
              ]}
            >
              {meta.error}
            </Text>
          )}
        </View>
      )}
      <View
        style={[richFieldStyles.editorWrap, styles.input__bg]}
        ref={editorRenderContainerRef}
      >
        <EditorRender
          html={html}
          placeholder={placeholder}
          onLayout={onLayout}
          onCursorPositionUpdate={onCursorPositionUpdate}
          containerStyle={{
            overflow: 'hidden',
            minHeight: 200,
            backgroundColor: styles.input__bg.backgroundColor as string,
          }}
        />
      </View>
    </View>
  )
}

const richFieldStyles = StyleSheet.create({
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
  editorWrap: {
    marginBottom: 8,
    borderRadius: 6,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
})

export default RichTextField
