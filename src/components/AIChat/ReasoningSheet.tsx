import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TrueSheet } from '@lodev09/react-native-true-sheet'

import V2exIcon from '@/components/icons/V2exIcon'

import MarkdownMessage from './MarkdownMessage'
import { AIChatColors, useAIChatTheme } from './theme'

export type ReasoningSheetHandle = { present: (reasoning: string) => void }

export default forwardRef<ReasoningSheetHandle>(
  function ReasoningSheet(_, ref) {
    const sheetRef = useRef<TrueSheet>(null)
    const insets = useSafeAreaInsets()
    const { colors } = useAIChatTheme()
    const styles = useMemo(() => createStyles(colors), [colors])
    const [reasoning, setReasoning] = useState('')

    useImperativeHandle(ref, () => ({
      present: (value) => {
        setReasoning(value)
        requestAnimationFrame(() => void sheetRef.current?.present())
      },
    }))

    return (
      <TrueSheet
        ref={sheetRef}
        detents={['auto', 1]}
        cornerRadius={28}
        grabber
        maxContentHeight={620}
        backgroundColor={colors.elevatedStrong}
      >
        <View
          style={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, 20) },
          ]}
        >
          <View style={styles.header}>
            <V2exIcon name='clock-outline' size={18} color={colors.text} />
            <Text style={styles.title}>推理摘要</Text>
          </View>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <MarkdownMessage markdown={reasoning} />
          </ScrollView>
        </View>
      </TrueSheet>
    )
  },
)

function createStyles(colors: AIChatColors) {
  return StyleSheet.create({
    content: { minHeight: 240, maxHeight: 620, paddingTop: 12 },
    header: {
      minHeight: 46,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      borderBottomColor: colors.border,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    title: { color: colors.text, fontSize: 16, fontWeight: '600' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 30 },
  })
}
