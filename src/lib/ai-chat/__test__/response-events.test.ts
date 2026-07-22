/// <reference types='jest' />

import {
  extractSseData,
  parseResponseEvent,
} from '@/lib/ai-chat/response-events'

describe('V2EX SSE response events', () => {
  it('keeps partial events between chunks', () => {
    const result = extractSseData(
      'data: {"choices":[{"delta":{"content":"Hi"}}]}\n\ndata: partial',
    )
    expect(result.events).toEqual(['{"choices":[{"delta":{"content":"Hi"}}]}'])
    expect(result.remainder).toBe('data: partial')
  })

  it('supports CRLF event boundaries', () => {
    expect(extractSseData('data: one\r\n\r\ndata: two\r\n\r\n').events).toEqual(
      ['one', 'two'],
    )
  })

  it('parses deltas, completion, and malformed events', () => {
    expect(
      parseResponseEvent(
        '{"id":"r1","choices":[{"delta":{"content":"你好"}}]}',
      ),
    ).toMatchObject({ kind: 'chunk', responseId: 'r1', text: '你好' })
    expect(parseResponseEvent('[DONE]')).toEqual({ kind: 'completed' })
    expect(parseResponseEvent('not-json')).toEqual({
      kind: 'failed',
      message: 'V2EX 返回了无法解析的流数据。',
    })
  })
})
