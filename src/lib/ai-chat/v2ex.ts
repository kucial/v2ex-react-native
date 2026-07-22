import { fetch } from 'react-native-nitro-fetch'
import { TextDecoder } from 'react-native-nitro-text-decoder'

import { AIChatPersonaSummary } from '@/types/ai-chat'

import { extractSseData, parseResponseEvent } from './response-events'

export const DEFAULT_PERSONA = 'v2ex'
export const V2EX_CHAT_BASE_URL = 'https://edge.v2ex.com/chat/v1'

export type AIChatConnectionState = 'idle' | 'connecting' | 'open' | 'closed'

export type AIChatHistoryMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type AIChatStreamCallbacks = {
  onConnectionState?: (state: AIChatConnectionState) => void
  onTextDelta: (delta: string, responseId?: string) => void
  onCompleted: () => void
  onError: (message: string) => void
}

export function buildChatCompletionPayload(options: {
  messages: AIChatHistoryMessage[]
  persona?: string
}): Record<string, unknown> {
  return {
    model: options.persona ?? DEFAULT_PERSONA,
    messages: options.messages,
    temperature: 0.7,
    max_completion_tokens: 2048,
    stream: true,
    stream_options: { include_usage: true },
  }
}

type ModelListResponse = {
  data?: { id?: string; owned_by?: string; created?: number }[]
  error?: { message?: string }
}

const MODEL_REQUEST_TIMEOUT_MS = 15_000

function authorizationHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

function apiErrorMessage(status: number, body: string): string {
  if (status === 401 || status === 403) {
    return 'V2EX Personal Access Token 无效，或没有 AI Chat 权限。'
  }
  if (status === 408 || status === 504) {
    return 'V2EX 响应超时，请稍后重试。'
  }
  if (status === 429) {
    return 'V2EX 请求额度已用完，请稍后重试。'
  }
  if (status >= 500) {
    return 'V2EX 服务暂时不可用，请稍后重试。'
  }

  try {
    const parsed = JSON.parse(body) as {
      error?: { message?: string } | string
    }
    const message =
      typeof parsed.error === 'string' ? parsed.error : parsed.error?.message
    if (message) return message
  } catch {
    // Use the stable HTTP fallback below.
  }
  return `V2EX 返回 HTTP ${status}。`
}

export class V2EXChatClient {
  private personalToken = ''
  private activeRequest: {
    controller: AbortController
    cancelled: boolean
  } | null = null

  setPersonalToken(token: string): void {
    this.personalToken = token.trim()
  }

  getPersonalToken(): string {
    return this.personalToken
  }

  hasPersonalToken(): boolean {
    return this.personalToken.length > 0
  }

  async listPersonas(): Promise<AIChatPersonaSummary[]> {
    if (!this.personalToken) {
      throw new Error('请先输入 V2EX Personal Access Token。')
    }

    const controller = new AbortController()
    const timeout = setTimeout(
      () => controller.abort(),
      MODEL_REQUEST_TIMEOUT_MS,
    )
    let response: Awaited<ReturnType<typeof fetch>>
    let body: string
    try {
      response = await fetch(`${V2EX_CHAT_BASE_URL}/models`, {
        cache: 'no-store',
        headers: authorizationHeaders(this.personalToken),
        signal: controller.signal,
      })
      body = await response.text()
    } catch {
      if (controller.signal.aborted) {
        throw new Error('V2EX 响应超时，请稍后重试。')
      }
      throw new Error('无法连接到 V2EX，请检查网络后重试。')
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) throw new Error(apiErrorMessage(response.status, body))

    let parsed: ModelListResponse
    try {
      parsed = JSON.parse(body) as ModelListResponse
    } catch {
      throw new Error('V2EX 返回了无法解析的 Persona 列表。')
    }
    if (!Array.isArray(parsed.data)) {
      throw new Error('V2EX 返回了无效的 Persona 列表。')
    }

    const personas = parsed.data
      .filter((model) => typeof model.id === 'string' && model.id.length > 0)
      .map((model) => ({
        id: model.id as string,
        ownedBy: model.owned_by,
        created: model.created,
      }))
      .sort((left, right) => left.id.localeCompare(right.id))

    if (personas.length === 0) {
      throw new Error('此 Token 没有可用的 V2EX Persona。')
    }
    return personas
  }

  async sendTurn(options: {
    messages: AIChatHistoryMessage[]
    persona?: string
    callbacks: AIChatStreamCallbacks
  }): Promise<void> {
    this.cancel()
    if (!this.personalToken) {
      options.callbacks.onError('发送消息前，请先输入 V2EX Token。')
      return
    }

    const controller = new AbortController()
    const request = { controller, cancelled: false }
    this.activeRequest = request
    options.callbacks.onConnectionState?.('connecting')

    let completed = false
    let sawFinishReason = false
    try {
      const response = await fetch(`${V2EX_CHAT_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: authorizationHeaders(this.personalToken),
        body: JSON.stringify(buildChatCompletionPayload(options)),
        signal: controller.signal,
        stream: true,
      })
      if (!response.ok) {
        throw new Error(apiErrorMessage(response.status, await response.text()))
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('V2EX 没有返回可读取的响应流。')

      options.callbacks.onConnectionState?.('open')
      const decoder = new TextDecoder()
      let buffer = ''

      while (!completed) {
        const { done, value } = await reader.read()
        buffer += decoder.decode(value, { stream: !done })
        const extracted = extractSseData(buffer)
        buffer = extracted.remainder

        for (const raw of extracted.events) {
          const event = parseResponseEvent(raw)
          if (event.kind === 'failed') throw new Error(event.message)
          if (event.kind === 'completed') {
            completed = true
            options.callbacks.onCompleted()
            break
          }
          if (event.text) {
            options.callbacks.onTextDelta(event.text, event.responseId)
          }
          sawFinishReason ||= Boolean(event.finishReason)
        }
        if (done) break
      }

      if (!completed && sawFinishReason) {
        options.callbacks.onCompleted()
      } else if (!completed) {
        throw new Error('V2EX 响应流在完成前意外中断。')
      }
    } catch (error) {
      if (!request.cancelled) {
        options.callbacks.onError(
          error instanceof Error ? error.message : 'V2EX 请求失败。',
        )
      }
    } finally {
      if (this.activeRequest === request) this.activeRequest = null
      options.callbacks.onConnectionState?.('closed')
    }
  }

  cancel(): void {
    if (!this.activeRequest) return
    this.activeRequest.cancelled = true
    this.activeRequest.controller.abort()
    this.activeRequest = null
  }
}
