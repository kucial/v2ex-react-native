/// <reference types='jest' />

import { parseChatState } from '@/lib/ai-chat/storage'

jest.mock('@/utils/storage', () => ({
  getJSON: jest.fn(),
  setJSON: jest.fn(),
}))

describe('AI chat storage', () => {
  it('accepts schema v2 state', () => {
    const state = {
      schemaVersion: 2,
      preferredPersona: 'v2ex',
      selectedConversationId: 'one',
      conversations: [],
    }
    expect(parseChatState(state)).toEqual(state)
  })

  it('keeps pinned personas, dropping blanks and duplicates', () => {
    const parsed = parseChatState({
      schemaVersion: 2,
      preferredPersona: 'v2ex',
      selectedConversationId: 'one',
      conversations: [],
      pinnedPersonas: ['v2ex', ' gpt ', 'v2ex', '', 3],
    })
    expect(parsed?.pinnedPersonas).toEqual(['v2ex', 'gpt'])
  })

  it('accepts state written before pinning existed', () => {
    const parsed = parseChatState({
      schemaVersion: 2,
      preferredPersona: 'v2ex',
      selectedConversationId: 'one',
      conversations: [],
    })
    expect(parsed?.pinnedPersonas).toBeUndefined()
  })

  it('rejects unsupported or incomplete state', () => {
    expect(parseChatState({ schemaVersion: 1 })).toBeNull()
    expect(parseChatState(null)).toBeNull()
  })
})
