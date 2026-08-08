/// <reference types='jest' />

import {
  buildChatCompletionPayload,
  isTokenAuthError,
  TOKEN_AUTH_ERROR_MESSAGE,
  V2EXChatClient,
} from '@/lib/ai-chat/v2ex'

const mockFetch = jest.fn()

jest.mock('react-native-nitro-fetch', () => ({
  fetch: (...args: unknown[]) => mockFetch(...args),
}))
jest.mock('react-native-nitro-text-decoder', () => ({
  TextDecoder: global.TextDecoder,
}))

describe('V2EX AI chat client', () => {
  beforeEach(() => jest.clearAllMocks())

  it('builds a stateless streaming payload', () => {
    expect(
      buildChatCompletionPayload({
        persona: 'helper',
        messages: [{ role: 'user', content: 'hello' }],
      }),
    ).toEqual({
      model: 'helper',
      messages: [{ role: 'user', content: 'hello' }],
      temperature: 0.7,
      max_completion_tokens: 2048,
      stream: true,
      stream_options: { include_usage: true },
    })
  })

  it('requires manual token input before loading personas', async () => {
    await expect(new V2EXChatClient().listPersonas()).rejects.toThrow(
      '请先输入 V2EX Personal Access Token。',
    )
  })

  it('loads and sorts personas with the manually supplied token', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          data: [
            { id: 'zeta', owned_by: 'v2ex' },
            { id: 'alpha', owned_by: 'v2ex' },
          ],
        }),
    })
    const client = new V2EXChatClient()
    client.setPersonalToken('manual-secret')
    await expect(client.listPersonas()).resolves.toEqual([
      { id: 'alpha', ownedBy: 'v2ex' },
      { id: 'zeta', ownedBy: 'v2ex' },
    ])
    expect(mockFetch).toHaveBeenCalledWith(
      'https://edge.v2ex.com/chat/v1/models',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer manual-secret',
        }),
      }),
    )
  })
})

describe('isTokenAuthError', () => {
  it('recognises the message the API layer produces for 401/403', () => {
    expect(isTokenAuthError(new Error(TOKEN_AUTH_ERROR_MESSAGE))).toBe(true)
    expect(isTokenAuthError(TOKEN_AUTH_ERROR_MESSAGE)).toBe(true)
  })

  it('leaves the token alone for failures that are not its fault', () => {
    // These must stay `false`: marking the token invalid on a network blip
    // would lock the user out of sending until they re-entered a good token.
    for (const message of [
      'V2EX 响应超时，请稍后重试。',
      'V2EX 请求额度已用完，请稍后重试。',
      'V2EX 服务暂时不可用，请稍后重试。',
      'V2EX 返回 HTTP 418。',
      'Network request failed',
    ]) {
      expect(isTokenAuthError(new Error(message))).toBe(false)
    }
  })

  it('tolerates junk input', () => {
    for (const value of [null, undefined, 0, '', {}, []]) {
      expect(isTokenAuthError(value)).toBe(false)
    }
  })
})
