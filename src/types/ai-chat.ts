export type AIChatMessageRole = 'user' | 'assistant'

export type AIChatMessageStatus =
  | 'complete'
  | 'streaming'
  | 'thinking'
  | 'failed'
  | 'cancelled'

export type AIChatMessageFeedback = 'up' | 'down' | null

export interface AIChatMessage {
  id: string
  role: AIChatMessageRole
  text: string
  reasoning: string
  createdAt: number
  status: AIChatMessageStatus
  feedback: AIChatMessageFeedback
  responseId?: string
  error?: string
}

export interface AIChatConversation {
  id: string
  title: string
  persona: string
  createdAt: number
  updatedAt: number
  messages: AIChatMessage[]
}

export interface PersistedAIChatState {
  schemaVersion: 2
  preferredPersona: string
  selectedConversationId: string
  conversations: AIChatConversation[]
  /** Persona ids the user pinned to the top of the picker. */
  pinnedPersonas?: string[]
}

export interface AIChatPersonaSummary {
  id: string
  ownedBy?: string
  created?: number
}
