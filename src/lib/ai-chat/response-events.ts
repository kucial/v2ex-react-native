export type ChatCompletionChunk = {
  kind: 'chunk'
  responseId?: string
  text: string
  finishReason?: string
}

export type ParsedResponseEvent =
  | ChatCompletionChunk
  | { kind: 'completed' }
  | { kind: 'failed'; message: string }

type ApiChunk = {
  id?: string
  choices?: {
    delta?: { content?: string | null }
    finish_reason?: string | null
  }[]
  error?: { message?: string } | string
}

export function extractSseData(buffer: string): {
  events: string[]
  remainder: string
} {
  const events: string[] = []
  let remainder = buffer

  while (true) {
    const boundary = /\r?\n\r?\n/.exec(remainder)
    if (!boundary || boundary.index === undefined) break

    const block = remainder.slice(0, boundary.index)
    remainder = remainder.slice(boundary.index + boundary[0].length)
    const data = block
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n')
    if (data) events.push(data)
  }

  return { events, remainder }
}

export function parseResponseEvent(raw: string): ParsedResponseEvent {
  if (raw.trim() === '[DONE]') return { kind: 'completed' }

  let event: ApiChunk
  try {
    event = JSON.parse(raw) as ApiChunk
  } catch {
    return { kind: 'failed', message: 'V2EX 返回了无法解析的流数据。' }
  }

  if (event.error) {
    return {
      kind: 'failed',
      message:
        typeof event.error === 'string'
          ? event.error
          : event.error.message || 'V2EX 返回了错误。',
    }
  }

  const choice = event.choices?.[0]
  return {
    kind: 'chunk',
    responseId: event.id,
    text: choice?.delta?.content ?? '',
    finishReason: choice?.finish_reason ?? undefined,
  }
}
