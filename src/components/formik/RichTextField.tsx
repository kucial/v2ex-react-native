import { MutableRefObject, ReactNode, useMemo, useRef } from 'react'
import { Text, View, ViewProps, ViewStyle } from 'react-native'
import classNames from 'classnames'
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
      <View
        className="mb-2 rounded-md overflow-hidden px-2 py-[10px]"
        style={styles.input__bg}
        ref={editorRenderContainerRef}>
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

export default RichTextField
