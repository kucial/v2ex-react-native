import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Pressable, Share, StyleSheet, Text, View } from 'react-native'
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOutDown,
} from 'react-native-reanimated'
import { useRecyclingState } from '@shopify/flash-list'
import * as Clipboard from 'expo-clipboard'
import * as Haptics from 'expo-haptics'

import V2exIcon, { V2exIconName } from '@/components/icons/V2exIcon'

import { AIChatMessage, AIChatMessageFeedback } from '@/types/ai-chat'

import MarkdownMessage from './MarkdownMessage'
import { pressFeedbackStyles } from './pressFeedback'
import { AIChatColors, useAIChatTheme } from './theme'
import ThinkingShimmer from './ThinkingShimmer'

type Props = {
  message: AIChatMessage
  onOpenReasoning: (reasoning: string) => void
  onRetry: (messageId: string) => void
  onFeedback: (messageId: string, feedback: AIChatMessageFeedback) => void
}

type MessageToast = {
  id: number
  text: string
  icon: V2exIconName
}

function ActionButton({
  label,
  name,
  selected,
  onPress,
}: {
  label: string
  name: V2exIconName
  selected?: boolean
  onPress: () => void
}) {
  const { colors } = useAIChatTheme()
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole='button'
      accessibilityState={{ selected }}
      onPress={onPress}
      hitSlop={9}
      style={({ pressed }) => [
        baseStyles.actionButton,
        selected && { backgroundColor: colors.elevatedStrong },
        pressed && pressFeedbackStyles.compact,
      ]}
    >
      <V2exIcon
        name={name}
        size={16}
        color={selected ? colors.text : colors.secondaryText}
      />
    </Pressable>
  )
}

export default function MessageRow({
  message,
  onOpenReasoning,
  onRetry,
  onFeedback,
}: Props) {
  const { colors } = useAIChatTheme()
  const styles = useMemo(() => createStyles(colors), [colors])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [toast, setToast] = useRecyclingState<MessageToast | null>(
    null,
    [message.id],
    () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = null
    },
  )

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    },
    [],
  )

  const showToast = useCallback(
    (text: string, icon: V2exIconName = 'check-outline') => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setToast((current) => ({
        id: (current?.id ?? 0) + 1,
        text,
        icon,
      }))
      timerRef.current = setTimeout(() => {
        setToast(null)
        timerRef.current = null
      }, 1800)
    },
    [setToast],
  )

  const copy = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(message.text)
      showToast('已复制到剪贴板')
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch {
      showToast('复制失败', 'exclamation-triangle-solid')
    }
  }, [message.text, showToast])

  const share = useCallback(async () => {
    try {
      const result = await Share.share({ message: message.text })
      showToast(
        result.action === Share.sharedAction ? '已分享回复' : '已取消分享',
        result.action === Share.sharedAction
          ? 'check-outline'
          : 'x-mark-outline',
      )
    } catch {
      showToast('分享失败', 'exclamation-triangle-solid')
    }
  }, [message.text, showToast])

  const submitFeedback = useCallback(
    (feedback: Exclude<AIChatMessageFeedback, null>) => {
      const removing = message.feedback === feedback
      onFeedback(message.id, feedback)
      void Haptics.selectionAsync()
      showToast(removing ? '已取消反馈' : '感谢你的反馈')
    },
    [message.feedback, message.id, onFeedback, showToast],
  )

  if (message.role === 'user') {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text selectable style={styles.userText}>
            {message.text}
          </Text>
        </View>
      </View>
    )
  }

  const thinking = message.status === 'thinking' && !message.text
  const streaming = message.status === 'streaming'
  const finished = message.status === 'complete'

  return (
    <Animated.View entering={FadeIn.duration(220)} style={styles.assistantRow}>
      {message.reasoning ? (
        <Pressable
          accessibilityLabel='查看推理摘要'
          accessibilityRole='button'
          onPress={() => onOpenReasoning(message.reasoning)}
          style={({ pressed }) => [
            styles.reasoningRow,
            pressed && pressFeedbackStyles.regular,
          ]}
        >
          <V2exIcon
            name='clock-outline'
            size={15}
            color={colors.secondaryText}
          />
          <Text numberOfLines={1} style={styles.reasoningLabel}>
            {message.reasoning
              .split('\n')
              .find(Boolean)
              ?.replace(/^#+\s*/, '') || '推理摘要'}
          </Text>
          <V2exIcon
            name='chevron-right-outline'
            size={13}
            color={colors.tertiaryText}
          />
        </Pressable>
      ) : null}

      {thinking ? <ThinkingShimmer /> : null}
      {message.text ? (
        <MarkdownMessage markdown={message.text} streaming={streaming} />
      ) : null}

      {message.status === 'failed' ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>
            {message.error || '此回复未能完成。'}
          </Text>
          <Pressable
            accessibilityLabel='重试回复'
            accessibilityRole='button'
            onPress={() => onRetry(message.id)}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && pressFeedbackStyles.regular,
            ]}
          >
            <V2exIcon name='arrow-path-outline' size={14} color={colors.text} />
            <Text style={styles.retryText}>重试</Text>
          </Pressable>
        </View>
      ) : null}

      {message.status === 'cancelled' && !message.text ? (
        <Text style={styles.cancelled}>已停止生成</Text>
      ) : null}

      {toast ? (
        <Animated.View
          key={toast.id}
          accessibilityLiveRegion='polite'
          accessibilityRole='alert'
          entering={FadeInUp.duration(180)}
          exiting={FadeOutDown.duration(150)}
          pointerEvents='none'
          style={styles.toast}
        >
          <V2exIcon name={toast.icon} size={13} color={colors.text} />
          <Text style={styles.toastText}>{toast.text}</Text>
        </Animated.View>
      ) : null}

      {finished && message.text ? (
        <View style={styles.actions}>
          <ActionButton
            label='复制回复'
            name='document-duplicate-outline'
            onPress={copy}
          />
          <ActionButton label='分享回复' name='share-outline' onPress={share} />
          {/* <ActionButton
            label='回复有帮助'
            name={
              message.feedback === 'up'
                ? 'hand-thumb-up-solid'
                : 'hand-thumb-up-outline'
            }
            selected={message.feedback === 'up'}
            onPress={() => submitFeedback('up')}
          />
          <ActionButton
            label='回复没有帮助'
            name={
              message.feedback === 'down'
                ? 'hand-thumb-down-solid'
                : 'hand-thumb-down-outline'
            }
            selected={message.feedback === 'down'}
            onPress={() => submitFeedback('down')}
          /> */}
        </View>
      ) : null}
    </Animated.View>
  )
}

function createStyles(colors: AIChatColors) {
  return StyleSheet.create({
    userRow: { alignItems: 'flex-end', marginBottom: 22 },
    userBubble: {
      maxWidth: '86%',
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      backgroundColor: colors.userBubble,
    },
    userText: { color: colors.text, fontSize: 16.5, lineHeight: 22 },
    assistantRow: { marginBottom: 30, paddingRight: 10, position: 'relative' },
    reasoningRow: {
      height: 34,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    reasoningLabel: {
      maxWidth: '78%',
      color: colors.secondaryText,
      fontSize: 14,
    },
    errorCard: {
      gap: 12,
      marginTop: 8,
      padding: 13,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.dangerBorder,
      backgroundColor: colors.dangerBackground,
    },
    errorText: { color: colors.dangerText, fontSize: 14, lineHeight: 19 },
    retryButton: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    retryText: { color: colors.text, fontSize: 14, fontWeight: '600' },
    cancelled: { color: colors.tertiaryText, fontSize: 14 },
    actions: {
      height: 34,
      marginTop: 9,
      marginLeft: -4,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    toast: {
      position: 'absolute',
      left: 0,
      bottom: 39,
      zIndex: 3,
      minHeight: 32,
      maxWidth: '90%',
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.elevatedStrong,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.24,
      shadowRadius: 12,
      elevation: 7,
    },
    toastText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  })
}

const baseStyles = StyleSheet.create({
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
