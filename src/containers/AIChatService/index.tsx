import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  createAssistantPlaceholder,
  createConversation,
  createUserMessage,
  sortConversations,
  titleFromMessage,
} from '@/lib/ai-chat/conversations'
import { loadChatState, saveChatState } from '@/lib/ai-chat/storage'
import {
  clearStoredPersonalToken,
  loadStoredPersonalToken,
  maskPersonalToken,
  saveStoredPersonalToken,
} from '@/lib/ai-chat/token-store'
import {
  AIChatConnectionState,
  AIChatHistoryMessage,
  DEFAULT_PERSONA,
  V2EXChatClient,
} from '@/lib/ai-chat/v2ex'
import {
  AIChatConversation,
  AIChatMessage,
  AIChatMessageFeedback,
  AIChatPersonaSummary,
  PersistedAIChatState,
} from '@/types/ai-chat'

type ActiveRequest = {
  conversationId: string
  assistantMessageId: string
}

export type PersonaLoadState = 'loading' | 'ready' | 'error'
export type PersonalTokenState = 'loading' | 'ready' | 'missing' | 'saving'
export type PersonalTokenSource = 'secure' | 'none'

type AIChatContextValue = {
  hydrated: boolean
  conversations: AIChatConversation[]
  selectedConversation: AIChatConversation
  persona: string
  personas: AIChatPersonaSummary[]
  hasLoadedPersonas: boolean
  personaLoadState: PersonaLoadState
  personaError?: string
  personalTokenState: PersonalTokenState
  personalTokenSource: PersonalTokenSource
  personalTokenPreview: string
  hasPersonalToken: boolean
  connectionState: AIChatConnectionState
  activeRequest: ActiveRequest | null
  selectConversation: (id: string) => void
  startNewConversation: () => void
  renameConversation: (id: string, title: string) => void
  deleteConversation: (id: string) => void
  sendMessage: (text: string) => Promise<void>
  retryMessage: (assistantMessageId: string) => Promise<void>
  stopGenerating: () => void
  setFeedback: (messageId: string, feedback: AIChatMessageFeedback) => void
  setPersona: (persona: string) => void
  reloadPersonas: () => Promise<void>
  savePersonalToken: (token: string) => Promise<void>
  clearPersonalToken: () => Promise<void>
}

const initialConversation = createConversation(DEFAULT_PERSONA)
const AIChatContext = createContext<AIChatContextValue | null>(null)

function repairState(saved: PersistedAIChatState | null): PersistedAIChatState {
  if (!saved) {
    return {
      schemaVersion: 2,
      preferredPersona: DEFAULT_PERSONA,
      selectedConversationId: initialConversation.id,
      conversations: [initialConversation],
    }
  }

  const conversations = saved.conversations.map((conversation) => ({
    ...conversation,
    messages: conversation.messages.map((message) =>
      message.status === 'streaming' || message.status === 'thinking'
        ? {
            ...message,
            status: 'failed' as const,
            error: '应用关闭时，回复生成被中断。',
          }
        : message,
    ),
  }))
  const fallback =
    conversations[0] ?? createConversation(saved.preferredPersona)
  return {
    schemaVersion: 2,
    preferredPersona: saved.preferredPersona || DEFAULT_PERSONA,
    conversations: conversations.length ? conversations : [fallback],
    selectedConversationId: conversations.some(
      (conversation) => conversation.id === saved.selectedConversationId,
    )
      ? saved.selectedConversationId
      : fallback.id,
  }
}

function messageHistory(messages: AIChatMessage[]): AIChatHistoryMessage[] {
  return messages
    .filter(
      (message) =>
        message.text.trim() &&
        (message.role === 'user' || message.status === 'complete'),
    )
    .map((message) => ({
      role: message.role,
      content: message.text.trim(),
    }))
}

export function AIChatProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(() => repairState(loadChatState()))
  const [hydrated, setHydrated] = useState(false)
  const [personas, setPersonas] = useState<AIChatPersonaSummary[]>([
    { id: DEFAULT_PERSONA },
  ])
  const [hasLoadedPersonas, setHasLoadedPersonas] = useState(false)
  const [personaLoadState, setPersonaLoadState] =
    useState<PersonaLoadState>('loading')
  const [personaError, setPersonaError] = useState<string>()
  const [personalTokenState, setPersonalTokenState] =
    useState<PersonalTokenState>('loading')
  const [personalTokenSource, setPersonalTokenSource] =
    useState<PersonalTokenSource>('none')
  const [personalTokenPreview, setPersonalTokenPreview] = useState('')
  const [connectionState, setConnectionState] =
    useState<AIChatConnectionState>('idle')
  const [activeRequest, setActiveRequest] = useState<ActiveRequest | null>(null)
  const activeRequestRef = useRef<ActiveRequest | null>(null)
  const personaRequestIdRef = useRef(0)
  const [transport] = useState(() => new V2EXChatClient())

  const applyAvailablePersonas = useCallback(
    (available: AIChatPersonaSummary[]) => {
      setPersonas(
        available.some((persona) => persona.id === DEFAULT_PERSONA)
          ? available
          : [{ id: DEFAULT_PERSONA }, ...available],
      )
      setHasLoadedPersonas(true)
      setPersonaLoadState('ready')
      setPersonaError(undefined)
    },
    [],
  )

  const reloadPersonas = useCallback(async () => {
    const requestId = ++personaRequestIdRef.current
    setPersonaLoadState('loading')
    setPersonaError(undefined)
    try {
      const available = await transport.listPersonas()
      if (requestId === personaRequestIdRef.current) {
        applyAvailablePersonas(available)
      }
    } catch (error) {
      if (requestId !== personaRequestIdRef.current) return
      setPersonaLoadState('error')
      setPersonaError(
        error instanceof Error ? error.message : '无法加载 V2EX Persona。',
      )
    }
  }, [applyAvailablePersonas, transport])

  useEffect(() => {
    setHydrated(true)
    return () => transport.cancel()
  }, [transport])

  useEffect(() => {
    let mounted = true
    loadStoredPersonalToken()
      .then((storedToken) => {
        if (!mounted) return
        const token = storedToken?.trim() ?? ''
        transport.setPersonalToken(token)
        setPersonalTokenSource(token ? 'secure' : 'none')
        setPersonalTokenState(token ? 'ready' : 'missing')
        setPersonalTokenPreview(maskPersonalToken(token))
        if (token) {
          void reloadPersonas()
        } else {
          setPersonaLoadState('error')
          setPersonaError('输入 V2EX Token 后即可加载 Persona。')
        }
      })
      .catch(() => {
        if (!mounted) return
        transport.setPersonalToken('')
        setPersonalTokenSource('none')
        setPersonalTokenState('missing')
        setPersonalTokenPreview('')
        setPersonaLoadState('error')
        setPersonaError('无法读取安全凭据，请重新输入 Token。')
      })
    return () => {
      mounted = false
    }
  }, [reloadPersonas, transport])

  useEffect(() => {
    if (!hydrated) return
    const timeout = setTimeout(() => saveChatState(state), 120)
    return () => clearTimeout(timeout)
  }, [hydrated, state])

  const selectedConversation =
    state.conversations.find(
      (conversation) => conversation.id === state.selectedConversationId,
    ) ?? state.conversations[0]

  const patchMessage = useCallback(
    (
      conversationId: string,
      messageId: string,
      updater: (message: AIChatMessage) => AIChatMessage,
    ) => {
      setState((current) => ({
        ...current,
        conversations: current.conversations.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                updatedAt: Date.now(),
                messages: conversation.messages.map((message) =>
                  message.id === messageId ? updater(message) : message,
                ),
              }
            : conversation,
        ),
      }))
    },
    [],
  )

  const finishRequest = useCallback(() => {
    activeRequestRef.current = null
    setActiveRequest(null)
  }, [])

  const beginStream = useCallback(
    async (
      conversation: AIChatConversation,
      history: AIChatMessage[],
      assistantMessageId: string,
    ) => {
      const request = {
        conversationId: conversation.id,
        assistantMessageId,
      }
      activeRequestRef.current = request
      setActiveRequest(request)

      await transport.sendTurn({
        messages: messageHistory(history),
        persona: conversation.persona,
        callbacks: {
          onConnectionState: setConnectionState,
          onTextDelta: (delta, responseId) => {
            patchMessage(conversation.id, assistantMessageId, (message) => ({
              ...message,
              status: 'streaming',
              text: message.text + delta,
              responseId: responseId ?? message.responseId,
              error: undefined,
            }))
          },
          onCompleted: () => {
            patchMessage(conversation.id, assistantMessageId, (message) => ({
              ...message,
              status: 'complete',
              error: undefined,
            }))
            finishRequest()
          },
          onError: (message) => {
            if (
              activeRequestRef.current?.assistantMessageId !==
              assistantMessageId
            ) {
              return
            }
            patchMessage(conversation.id, assistantMessageId, (current) => ({
              ...current,
              status: 'failed',
              error: message,
            }))
            finishRequest()
          },
        },
      })
    },
    [finishRequest, patchMessage, transport],
  )

  const stopGenerating = useCallback(() => {
    const active = activeRequestRef.current
    transport.cancel()
    if (active) {
      patchMessage(
        active.conversationId,
        active.assistantMessageId,
        (message) => ({
          ...message,
          status: 'cancelled',
        }),
      )
    }
    setConnectionState('idle')
    finishRequest()
  }, [finishRequest, patchMessage, transport])

  const savePersonalToken = useCallback(
    async (token: string) => {
      const cleaned = token.trim()
      if (!cleaned) throw new Error('请输入 V2EX Personal Access Token。')

      stopGenerating()
      const previousToken = transport.getPersonalToken()
      const previousSource = personalTokenSource
      const previousPreview = personalTokenPreview
      personaRequestIdRef.current += 1
      setPersonalTokenState('saving')
      setPersonaLoadState('loading')
      setPersonaError(undefined)
      transport.setPersonalToken(cleaned)

      try {
        const available = await transport.listPersonas()
        await saveStoredPersonalToken(cleaned)
        applyAvailablePersonas(available)
        setPersonalTokenSource('secure')
        setPersonalTokenState('ready')
        setPersonalTokenPreview(maskPersonalToken(cleaned))
      } catch (error) {
        transport.setPersonalToken(previousToken)
        setPersonalTokenSource(previousSource)
        setPersonalTokenState(previousToken ? 'ready' : 'missing')
        setPersonalTokenPreview(previousPreview)
        setPersonaLoadState('error')
        setPersonaError(
          error instanceof Error ? error.message : '无法验证 V2EX Token。',
        )
        throw error
      }
    },
    [
      applyAvailablePersonas,
      personalTokenPreview,
      personalTokenSource,
      stopGenerating,
      transport,
    ],
  )

  const clearPersonalToken = useCallback(async () => {
    stopGenerating()
    await clearStoredPersonalToken()
    personaRequestIdRef.current += 1
    transport.setPersonalToken('')
    setPersonalTokenSource('none')
    setPersonalTokenState('missing')
    setPersonalTokenPreview('')
    setPersonas([{ id: DEFAULT_PERSONA }])
    setHasLoadedPersonas(false)
    setPersonaLoadState('error')
    setPersonaError('输入 V2EX Token 后即可加载 Persona。')
  }, [stopGenerating, transport])

  const startNewConversation = useCallback(() => {
    stopGenerating()
    setState((current) => {
      const conversation = createConversation(current.preferredPersona)
      return {
        ...current,
        selectedConversationId: conversation.id,
        conversations: [conversation, ...current.conversations],
      }
    })
  }, [stopGenerating])

  const selectConversation = useCallback((id: string) => {
    setState((current) => ({ ...current, selectedConversationId: id }))
  }, [])

  const setPersona = useCallback(
    (nextPersona: string) => {
      const cleaned = nextPersona.trim()
      if (!cleaned || cleaned === selectedConversation.persona) return
      stopGenerating()
      setState((current) => ({
        ...current,
        preferredPersona: cleaned,
        conversations: current.conversations.map((conversation) =>
          conversation.id === current.selectedConversationId
            ? { ...conversation, persona: cleaned, updatedAt: Date.now() }
            : conversation,
        ),
      }))
    },
    [selectedConversation.persona, stopGenerating],
  )

  const renameConversation = useCallback((id: string, title: string) => {
    const cleaned = title.trim()
    if (!cleaned) return
    setState((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === id
          ? { ...conversation, title: cleaned, updatedAt: Date.now() }
          : conversation,
      ),
    }))
  }, [])

  const deleteConversation = useCallback(
    (id: string) => {
      if (activeRequestRef.current?.conversationId === id) stopGenerating()
      setState((current) => {
        const remaining = current.conversations.filter(
          (conversation) => conversation.id !== id,
        )
        const fallback =
          remaining[0] ?? createConversation(current.preferredPersona)
        return {
          ...current,
          conversations: remaining.length ? remaining : [fallback],
          selectedConversationId:
            current.selectedConversationId === id
              ? fallback.id
              : current.selectedConversationId,
        }
      })
    },
    [stopGenerating],
  )

  const sendMessage = useCallback(
    async (text: string) => {
      const cleanText = text.trim()
      if (!cleanText) return
      stopGenerating()

      const userMessage = createUserMessage(cleanText)
      const assistantMessage = createAssistantPlaceholder()
      const snapshot: AIChatConversation = {
        ...selectedConversation,
        title:
          selectedConversation.messages.length === 0
            ? titleFromMessage(cleanText)
            : selectedConversation.title,
        updatedAt: Date.now(),
        messages: [
          ...selectedConversation.messages,
          userMessage,
          assistantMessage,
        ],
      }
      setState((current) => ({
        ...current,
        conversations: current.conversations.map((conversation) =>
          conversation.id === snapshot.id ? snapshot : conversation,
        ),
      }))
      await beginStream(
        snapshot,
        snapshot.messages.slice(0, -1),
        assistantMessage.id,
      )
    },
    [beginStream, selectedConversation, stopGenerating],
  )

  const retryMessage = useCallback(
    async (assistantMessageId: string) => {
      const assistantIndex = selectedConversation.messages.findIndex(
        (message) => message.id === assistantMessageId,
      )
      const history = selectedConversation.messages.slice(0, assistantIndex)
      if (![...history].reverse().some((message) => message.role === 'user')) {
        return
      }
      stopGenerating()
      patchMessage(selectedConversation.id, assistantMessageId, (message) => ({
        ...message,
        text: '',
        reasoning: '',
        status: 'thinking',
        error: undefined,
      }))
      await beginStream(selectedConversation, history, assistantMessageId)
    },
    [beginStream, patchMessage, selectedConversation, stopGenerating],
  )

  const setFeedback = useCallback(
    (messageId: string, feedback: AIChatMessageFeedback) => {
      patchMessage(selectedConversation.id, messageId, (message) => ({
        ...message,
        feedback: message.feedback === feedback ? null : feedback,
      }))
    },
    [patchMessage, selectedConversation.id],
  )

  const value = useMemo<AIChatContextValue>(
    () => ({
      hydrated,
      conversations: sortConversations(state.conversations),
      selectedConversation,
      persona: selectedConversation.persona,
      personas,
      hasLoadedPersonas,
      personaLoadState,
      personaError,
      personalTokenState,
      personalTokenSource,
      personalTokenPreview,
      hasPersonalToken:
        personalTokenState === 'ready' && personalTokenSource === 'secure',
      connectionState,
      activeRequest,
      selectConversation,
      startNewConversation,
      renameConversation,
      deleteConversation,
      sendMessage,
      retryMessage,
      stopGenerating,
      setFeedback,
      setPersona,
      reloadPersonas,
      savePersonalToken,
      clearPersonalToken,
    }),
    [
      activeRequest,
      clearPersonalToken,
      connectionState,
      deleteConversation,
      hasLoadedPersonas,
      hydrated,
      personaError,
      personaLoadState,
      personalTokenSource,
      personalTokenState,
      personalTokenPreview,
      personas,
      reloadPersonas,
      renameConversation,
      retryMessage,
      savePersonalToken,
      selectConversation,
      selectedConversation,
      sendMessage,
      setFeedback,
      setPersona,
      startNewConversation,
      state.conversations,
      stopGenerating,
    ],
  )

  return (
    <AIChatContext.Provider value={value}>{children}</AIChatContext.Provider>
  )
}

export function useAIChat(): AIChatContextValue {
  const value = useContext(AIChatContext)
  if (!value) throw new Error('useAIChat must be used inside AIChatProvider')
  return value
}
