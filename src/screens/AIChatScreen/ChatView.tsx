import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Keyboard,
  Pressable,
  ScrollViewProps,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FlashList, FlashListRef } from '@shopify/flash-list'
import { LinearGradient } from 'expo-linear-gradient'

import Composer from '@/components/AIChat/Composer'
import GlassSurface from '@/components/AIChat/GlassSurface'
import MessageRow from '@/components/AIChat/MessageRow'
import PersonaPickerSheet, {
  PersonaPickerSheetHandle,
} from '@/components/AIChat/PersonaPickerSheet'
import { pressFeedbackStyles } from '@/components/AIChat/pressFeedback'
import ReasoningSheet, {
  ReasoningSheetHandle,
} from '@/components/AIChat/ReasoningSheet'
import { useAIChatTheme } from '@/components/AIChat/theme'
import TokenInputSheet, {
  TokenInputSheetHandle,
} from '@/components/AIChat/TokenInputSheet'
import VirtualizedChatScrollView, {
  ChatScrollViewHandle,
} from '@/components/AIChat/VirtualizedChatScrollView'
import AppBrandIcon from '@/components/AppBrandIcon'
import V2exIcon from '@/components/icons/V2exIcon'

import { CONTENT_CONTAINER_MAX_WIDTH } from '@/constants'
import { useAIChat } from '@/containers/AIChatService'
import { AIChatMessage } from '@/types/ai-chat'

const INITIAL_COMPOSER_HEIGHT = 68
const MESSAGE_COMPOSER_GAP = 8

function EmptyMark({ composerHeight }: { composerHeight: number }) {
  const { colors } = useAIChatTheme()
  const { progress } = useReanimatedKeyboardAnimation()
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * -(composerHeight + 16) }],
  }))
  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      style={[chatStyles.emptyMark, animatedStyle]}
    >
      <View style={chatStyles.logoWrapper}>
        <AppBrandIcon width={44} />
      </View>
      <Text style={[chatStyles.emptyTitle, { color: colors.text }]}>
        有什么可以帮你？
      </Text>
      <Text style={[chatStyles.emptySubtitle, { color: colors.secondaryText }]}>
        选择一个 V2EX Persona，然后开始聊天。
      </Text>
    </Animated.View>
  )
}

export default function ChatView({
  onOpenRecents,
}: {
  onOpenRecents: () => void
}) {
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const { colors } = useAIChatTheme()
  const {
    selectedConversation,
    persona,
    personas,
    hasLoadedPersonas,
    personaLoadState,
    personaError,
    personalTokenState,
    personalTokenSource,
    personalTokenPreview,
    hasPersonalToken,
    setPersona,
    reloadPersonas,
    savePersonalToken,
    clearPersonalToken,
    activeRequest,
    sendMessage,
    retryMessage,
    stopGenerating,
    setFeedback,
    startNewConversation,
  } = useAIChat()
  const [composerHeight, setComposerHeight] = useState(INITIAL_COMPOSER_HEIGHT)
  const composerInset = useSharedValue(
    INITIAL_COMPOSER_HEIGHT + MESSAGE_COMPOSER_GAP,
  )
  const listRef = useRef<FlashListRef<AIChatMessage>>(null)
  const chatScrollViewRef = useRef<ChatScrollViewHandle | null>(null)
  const scrollFrameRef = useRef<number | null>(null)
  const reasoningSheet = useRef<ReasoningSheetHandle>(null)
  const personaSheet = useRef<PersonaPickerSheetHandle>(null)
  const tokenSheet = useRef<TokenInputSheetHandle>(null)
  const messages = selectedConversation.messages
  const isGenerating = activeRequest?.conversationId === selectedConversation.id
  const lastMessage = messages[messages.length - 1]

  const scrollToLatest = useCallback((animated = true) => {
    if (scrollFrameRef.current !== null)
      cancelAnimationFrame(scrollFrameRef.current)
    scrollFrameRef.current = requestAnimationFrame(() => {
      scrollFrameRef.current = null
      listRef.current?.scrollToEnd({ animated })
    })
  }, [])

  useEffect(() => {
    if (messages.length) scrollToLatest(lastMessage?.status !== 'streaming')
  }, [
    composerHeight,
    lastMessage?.status,
    lastMessage?.text,
    messages.length,
    scrollToLatest,
  ])

  useEffect(
    () => () => {
      if (scrollFrameRef.current !== null)
        cancelAnimationFrame(scrollFrameRef.current)
    },
    [],
  )

  const openTokenInput = useCallback(() => {
    Keyboard.dismiss()
    tokenSheet.current?.present()
  }, [])

  const handleSend = useCallback(
    (text: string) => {
      if (personalTokenState === 'loading' || personalTokenState === 'saving') {
        return false
      }
      if (!hasPersonalToken) {
        openTokenInput()
        return false
      }
      void sendMessage(text)
      return true
    },
    [hasPersonalToken, openTokenInput, personalTokenState, sendMessage],
  )

  const renderItem = useCallback(
    ({ item }: { item: AIChatMessage }) => (
      <MessageRow
        message={item}
        onOpenReasoning={(reasoning) =>
          reasoningSheet.current?.present(reasoning)
        }
        onRetry={retryMessage}
        onFeedback={setFeedback}
      />
    ),
    [retryMessage, setFeedback],
  )

  const renderScrollComponent = useCallback(
    (props: ScrollViewProps) => (
      <VirtualizedChatScrollView
        {...props}
        chatScrollViewRef={chatScrollViewRef}
        extraContentPadding={composerInset}
      />
    ),
    [composerInset],
  )

  const listWidth = Math.min(width, CONTENT_CONTAINER_MAX_WIDTH)

  return (
    <View style={[chatStyles.screen, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.glowStart, colors.glowEnd]}
        locations={[0, 0.38]}
        pointerEvents='none'
        style={StyleSheet.absoluteFill}
      />

      <FlashList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        getItemType={(item) => item.role}
        maintainVisibleContentPosition={{ disabled: true }}
        keyboardDismissMode='interactive'
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
        renderScrollComponent={renderScrollComponent}
        ListEmptyComponent={<EmptyMark composerHeight={composerHeight} />}
        contentContainerStyle={{
          paddingTop: insets.top + 72,
          // paddingBottom: composerHeight + 12,
          paddingHorizontal: Math.max(16, (width - listWidth) / 2 + 16),
        }}
      />

      <View
        style={[
          chatStyles.header,
          { height: insets.top + 52, paddingTop: insets.top + 5 },
        ]}
        pointerEvents='box-none'
      >
        <Pressable
          accessibilityLabel='打开最近对话'
          accessibilityRole='button'
          onPress={() => {
            Keyboard.dismiss()
            onOpenRecents()
          }}
          style={({ pressed }) => [
            chatStyles.headerButton,
            pressed && pressFeedbackStyles.compact,
          ]}
        >
          <GlassSurface interactive style={chatStyles.headerGlass}>
            <V2exIcon name='bars-3-outline' size={17} color={colors.text} />
          </GlassSurface>
        </Pressable>

        <Pressable
          accessibilityLabel='选择 Persona'
          accessibilityRole='button'
          onPress={() => {
            Keyboard.dismiss()
            personaSheet.current?.present()
          }}
          style={({ pressed }) =>
            pressed ? pressFeedbackStyles.regular : undefined
          }
        >
          <GlassSurface interactive style={chatStyles.modelPill}>
            <Text
              numberOfLines={1}
              style={[chatStyles.modelText, { color: colors.text }]}
            >
              {persona}
            </Text>
            <V2exIcon
              name='chevron-down-outline'
              size={10}
              color={colors.secondaryText}
            />
          </GlassSurface>
        </Pressable>

        <Pressable
          accessibilityLabel='新建对话'
          accessibilityRole='button'
          onPress={startNewConversation}
          style={({ pressed }) => [
            chatStyles.headerButton,
            pressed && pressFeedbackStyles.compact,
          ]}
        >
          <GlassSurface interactive style={chatStyles.headerGlass}>
            <V2exIcon
              name='pencil-square-outline'
              size={17}
              color={colors.text}
            />
          </GlassSurface>
        </Pressable>
      </View>

      <Composer
        isGenerating={isGenerating}
        onSend={handleSend}
        onStop={stopGenerating}
        onHeightChange={(height) => {
          setComposerHeight(height)
          composerInset.set(height + MESSAGE_COMPOSER_GAP)
        }}
      />
      <ReasoningSheet ref={reasoningSheet} />
      <PersonaPickerSheet
        ref={personaSheet}
        selectedPersona={persona}
        personas={personas}
        hasLoadedPersonas={hasLoadedPersonas}
        loadState={personaLoadState}
        error={personaError}
        tokenSource={personalTokenSource}
        onSelect={setPersona}
        onRetry={reloadPersonas}
        onManageToken={openTokenInput}
      />
      <TokenInputSheet
        ref={tokenSheet}
        source={personalTokenSource}
        maskedToken={personalTokenPreview}
        onSave={savePersonalToken}
        onClear={clearPersonalToken}
        onBeforeNavigate={() => personaSheet.current?.dismiss()}
      />
    </View>
  )
}

const chatStyles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: { width: 42, height: 42 },
  headerGlass: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  modelPill: {
    height: 40,
    maxWidth: 220,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    overflow: 'hidden',
  },
  modelText: { maxWidth: 175, fontSize: 14, fontWeight: '600' },
  emptyMark: {
    flex: 1,
    minHeight: 420,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoWrapper: {
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 25, fontWeight: '700', letterSpacing: -0.5 },
  emptySubtitle: { marginTop: 8, fontSize: 14, textAlign: 'center' },
})
