import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { TrueSheet } from '@lodev09/react-native-true-sheet'

import { AIChatConversation } from '@/types/ai-chat'

import { pressFeedbackStyles } from './pressFeedback'
import { AIChatColors, useAIChatTheme } from './theme'

export type RenameConversationSheetHandle = {
  present: (conversation: AIChatConversation) => void
}

export default forwardRef<
  RenameConversationSheetHandle,
  { onRename: (id: string, title: string) => void }
>(function RenameConversationSheet({ onRename }, ref) {
  const sheetRef = useRef<TrueSheet>(null)
  const { colors } = useAIChatTheme()
  const styles = useMemo(() => createStyles(colors), [colors])
  const [conversationId, setConversationId] = useState('')
  const [title, setTitle] = useState('')

  useImperativeHandle(ref, () => ({
    present: (conversation) => {
      setConversationId(conversation.id)
      setTitle(conversation.title)
      void sheetRef.current?.present()
    },
  }))

  const save = async () => {
    if (!conversationId || !title.trim()) return
    onRename(conversationId, title.trim())
    await sheetRef.current?.dismiss()
  }

  return (
    <TrueSheet
      ref={sheetRef}
      detents={['auto']}
      cornerRadius={28}
      grabber
      backgroundColor={colors.elevatedStrong}
    >
      <View style={styles.content}>
        <Text style={styles.title}>重命名对话</Text>
        <TextInput
          accessibilityLabel='对话名称'
          autoFocus
          maxLength={80}
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={() => void save()}
          style={styles.input}
        />
        <Pressable
          accessibilityLabel='保存对话名称'
          accessibilityRole='button'
          accessibilityState={{ disabled: !title.trim() }}
          disabled={!title.trim()}
          onPress={() => void save()}
          style={({ pressed }) => [
            styles.button,
            !title.trim() && styles.disabled,
            pressed && pressFeedbackStyles.regular,
          ]}
        >
          <Text style={styles.buttonText}>保存</Text>
        </Pressable>
      </View>
    </TrueSheet>
  )
})

function createStyles(colors: AIChatColors) {
  return StyleSheet.create({
    content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 34 },
    title: { color: colors.text, fontSize: 20, fontWeight: '700' },
    input: {
      height: 48,
      marginTop: 18,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: colors.elevated,
      color: colors.text,
      fontSize: 15,
    },
    button: {
      height: 46,
      marginTop: 14,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
    },
    buttonText: { color: colors.accentText, fontWeight: '700' },
    disabled: { opacity: 0.35 },
  })
}
