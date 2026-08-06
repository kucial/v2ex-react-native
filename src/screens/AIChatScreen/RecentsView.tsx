import { useCallback, useRef } from 'react'
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'

import { pressFeedbackStyles } from '@/components/AIChat/pressFeedback'
import RenameConversationSheet, {
  RenameConversationSheetHandle,
} from '@/components/AIChat/RenameConversationSheet'
import { useAIChatTheme } from '@/components/AIChat/theme'
import V2exIcon from '@/components/icons/V2exIcon'

import { CONTENT_CONTAINER_MAX_WIDTH } from '@/constants'
import { useAIChat } from '@/containers/AIChatService'
import { AIChatConversation } from '@/types/ai-chat'

function sectionLabel(timestamp: number): string {
  const now = new Date()
  const date = new Date(timestamp)
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime()
  const day = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime()
  const difference = Math.round((today - day) / 86_400_000)
  if (difference === 0) return '今天'
  if (difference === 1) return '昨天'
  if (difference < 7) return '过去 7 天'
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
}

export default function RecentsView({
  onOpenChat,
}: {
  onOpenChat: () => void
}) {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const { colors } = useAIChatTheme()
  const renameSheet = useRef<RenameConversationSheetHandle>(null)
  const {
    conversations,
    selectedConversation,
    selectConversation,
    startNewConversation,
    renameConversation,
    deleteConversation,
  } = useAIChat()

  const openConversation = useCallback(
    (id: string) => {
      selectConversation(id)
      onOpenChat()
    },
    [onOpenChat, selectConversation],
  )

  const confirmDelete = useCallback(
    (conversation: AIChatConversation) => {
      Alert.alert('删除对话？', `“${conversation.title}”将从此设备移除。`, [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => deleteConversation(conversation.id),
        },
      ])
    },
    [deleteConversation],
  )

  const showActions = useCallback(
    (conversation: AIChatConversation) => {
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['取消', '重命名', '删除'],
            cancelButtonIndex: 0,
            destructiveButtonIndex: 2,
            title: conversation.title,
          },
          (index) => {
            if (index === 1) renameSheet.current?.present(conversation)
            if (index === 2) confirmDelete(conversation)
          },
        )
        return
      }
      Alert.alert(conversation.title, undefined, [
        { text: '取消', style: 'cancel' },
        {
          text: '重命名',
          onPress: () => renameSheet.current?.present(conversation),
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => confirmDelete(conversation),
        },
      ])
    },
    [confirmDelete],
  )

  const maxWidth = Math.min(width, CONTENT_CONTAINER_MAX_WIDTH)

  return (
    <View
      style={[
        recentsStyles.screen,
        { paddingTop: insets.top, backgroundColor: colors.recentsBackground },
      ]}
    >
      <View style={[recentsStyles.header, { width: maxWidth }]}>
        <View>
          <Text style={[recentsStyles.eyebrow, { color: colors.tertiaryText }]}>
            V2EX AI
          </Text>
          <Text style={[recentsStyles.title, { color: colors.text }]}>
            最近对话
          </Text>
        </View>
        <Pressable
          accessibilityLabel='新建对话'
          accessibilityRole='button'
          onPress={() => {
            startNewConversation()
            onOpenChat()
          }}
          style={({ pressed }) => [
            recentsStyles.headerButton,
            { backgroundColor: colors.elevatedStrong },
            pressed && pressFeedbackStyles.compact,
          ]}
        >
          <V2exIcon
            name='pencil-square-outline'
            size={20}
            color={colors.text}
          />
        </Pressable>
      </View>

      <FlashList
        data={conversations}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Math.max(12, (width - maxWidth) / 2 + 12),
          paddingBottom: 30,
        }}
        renderItem={({ item, index }) => {
          const previous = conversations[index - 1]
          const label = sectionLabel(item.updatedAt)
          const showSection =
            !previous || sectionLabel(previous.updatedAt) !== label
          const lastMessage = [...item.messages]
            .reverse()
            .find((message) => message.text)
          return (
            <View>
              {showSection ? (
                <Text
                  style={[
                    recentsStyles.section,
                    { color: colors.tertiaryText },
                  ]}
                >
                  {label}
                </Text>
              ) : null}
              <Pressable
                accessibilityLabel={`打开 ${item.title}`}
                accessibilityRole='button'
                accessibilityState={{
                  selected: item.id === selectedConversation.id,
                }}
                onPress={() => openConversation(item.id)}
                onLongPress={() => showActions(item)}
                style={({ pressed }) => [
                  recentsStyles.row,
                  item.id === selectedConversation.id && {
                    backgroundColor: colors.elevatedStrong,
                  },
                  pressed && pressFeedbackStyles.regular,
                ]}
              >
                <View style={recentsStyles.rowText}>
                  <View
                    style={{
                      flexDirection: 'row',
                      width: '100%',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={[recentsStyles.rowTitle, { color: colors.text }]}
                    >
                      [{item.persona}] {item.title}
                    </Text>
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[
                      recentsStyles.preview,
                      { color: colors.tertiaryText },
                    ]}
                  >
                    {lastMessage?.text || '开始一段对话'}
                  </Text>
                </View>
                <V2exIcon
                  name='chevron-right-outline'
                  size={13}
                  color={colors.tertiaryText}
                />
              </Pressable>
            </View>
          )
        }}
      />

      <Text
        style={[
          recentsStyles.hint,
          {
            paddingBottom: Math.max(insets.bottom, 14),
            color: colors.mutedText,
          },
        ]}
      >
        向左滑动返回聊天
      </Text>
      <RenameConversationSheet
        ref={renameSheet}
        onRename={renameConversation}
      />
    </View>
  )
}

const recentsStyles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    height: 82,
    paddingHorizontal: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  title: { marginTop: 2, fontSize: 28, fontWeight: '700', letterSpacing: -0.8 },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: 18,
    marginBottom: 7,
    marginHorizontal: 10,
    fontSize: 12,
  },
  row: {
    minHeight: 66,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 15,
  },
  rowText: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 15.5, fontWeight: '600' },
  preview: { fontSize: 13 },
  hint: { paddingTop: 8, textAlign: 'center', fontSize: 11 },
})
