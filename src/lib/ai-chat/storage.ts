import { PersistedAIChatState } from '@/types/ai-chat'
import { getJSON, setJSON } from '@/utils/storage'

export const AI_CHAT_STORAGE_KEY = '$app$/ai-chat'

export function parseChatState(raw: unknown): PersistedAIChatState | null {
  if (!raw || typeof raw !== 'object') return null
  const parsed = raw as Partial<PersistedAIChatState>
  if (
    parsed.schemaVersion !== 2 ||
    typeof parsed.preferredPersona !== 'string' ||
    typeof parsed.selectedConversationId !== 'string' ||
    !Array.isArray(parsed.conversations)
  ) {
    return null
  }
  return parsed as PersistedAIChatState
}

export function loadChatState(): PersistedAIChatState | null {
  try {
    return parseChatState(getJSON(AI_CHAT_STORAGE_KEY))
  } catch {
    return null
  }
}

export function saveChatState(state: PersistedAIChatState): void {
  setJSON(AI_CHAT_STORAGE_KEY, state)
}
