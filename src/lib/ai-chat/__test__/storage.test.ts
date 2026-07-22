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

  it('rejects unsupported or incomplete state', () => {
    expect(parseChatState({ schemaVersion: 1 })).toBeNull()
    expect(parseChatState(null)).toBeNull()
  })
})
