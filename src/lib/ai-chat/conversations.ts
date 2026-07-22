import * as Crypto from 'expo-crypto'

import { AIChatConversation, AIChatMessage } from '@/types/ai-chat'

const createId = (prefix: string) => `${prefix}_${Crypto.randomUUID()}`

export function createConversation(
  persona = 'v2ex',
  now = Date.now(),
): AIChatConversation {
  return {
    id: createId('conversation'),
    title: '新对话',
    persona,
    createdAt: now,
    updatedAt: now,
    messages: [],
  }
}

export function createUserMessage(
  text: string,
  now = Date.now(),
): AIChatMessage {
  return {
    id: createId('message'),
    role: 'user',
    text,
    reasoning: '',
    createdAt: now,
    status: 'complete',
    feedback: null,
  }
}

export function createAssistantPlaceholder(now = Date.now()): AIChatMessage {
  return {
    id: createId('message'),
    role: 'assistant',
    text: '',
    reasoning: '',
    createdAt: now,
    status: 'thinking',
    feedback: null,
  }
}

export function titleFromMessage(text: string): string {
  const compact = text.replace(/\s+/g, ' ').trim()
  if (!compact) return '新对话'
  return compact.length > 42 ? `${compact.slice(0, 39).trimEnd()}…` : compact
}

export function sortConversations(
  conversations: AIChatConversation[],
): AIChatConversation[] {
  return [...conversations].sort(
    (left, right) => right.updatedAt - left.updatedAt,
  )
}
