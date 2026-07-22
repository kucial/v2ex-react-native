/// <reference types='jest' />

import {
  sortConversations,
  titleFromMessage,
} from '@/lib/ai-chat/conversations'
import { AIChatConversation } from '@/types/ai-chat'

describe('AI chat conversations', () => {
  it('normalizes and truncates conversation titles', () => {
    expect(titleFromMessage('  hello   V2EX  ')).toBe('hello V2EX')
    expect(titleFromMessage('x'.repeat(50))).toBe(`${'x'.repeat(39)}…`)
  })

  it('sorts conversations by most recent update', () => {
    const conversation = (
      id: string,
      updatedAt: number,
    ): AIChatConversation => ({
      id,
      title: id,
      persona: 'v2ex',
      createdAt: updatedAt,
      updatedAt,
      messages: [],
    })
    expect(
      sortConversations([
        conversation('older', 1),
        conversation('newer', 2),
      ]).map((item) => item.id),
    ).toEqual(['newer', 'older'])
  })
})
