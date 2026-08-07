import { PersistedAIChatState } from '@/types/ai-chat'
import { getJSON, setJSON } from '@/utils/storage'

export const AI_CHAT_STORAGE_KEY = '$app$/ai-chat'

/**
 * `pinnedPersonas` was added after v2 shipped, so state written by older builds
 * simply omits it — keep it optional instead of rejecting the whole payload.
 */
function parsePinnedPersonas(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined
  const seen = new Set<string>()
  raw.forEach((entry) => {
    if (typeof entry === 'string' && entry.trim()) seen.add(entry.trim())
  })
  return [...seen]
}

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
  const pinnedPersonas = parsePinnedPersonas(parsed.pinnedPersonas)
  return {
    ...(parsed as PersistedAIChatState),
    ...(pinnedPersonas ? { pinnedPersonas } : {}),
  }
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
