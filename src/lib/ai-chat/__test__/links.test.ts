/// <reference types='jest' />

import {
  resolveMarkdownLink,
  resolveMarkdownLinkTarget,
} from '@/lib/ai-chat/links'

describe('AI chat Markdown links', () => {
  it('normalizes relative and native file links to V2EX URLs', () => {
    expect(resolveMarkdownLink('/go/programmer')).toBe(
      'https://www.v2ex.com/go/programmer',
    )
    expect(resolveMarkdownLink('file:///member/Livid')).toBe(
      'https://www.v2ex.com/member/Livid',
    )
  })

  it('maps supported V2EX content to in-app screens', () => {
    expect(resolveMarkdownLinkTarget('/go/programmer').screen).toEqual({
      name: 'node',
      pathname: '/node/[name]',
      params: { name: 'programmer' },
    })
    expect(
      resolveMarkdownLinkTarget('https://v2ex.com/t/123#reply4').screen,
    ).toEqual({
      name: 'topic',
      pathname: '/topic/[id]',
      params: { id: '123' },
    })
  })

  it('leaves external URLs and system schemes for fallback handling', () => {
    expect(resolveMarkdownLinkTarget('https://example.com').screen).toBe(
      undefined,
    )
    expect(resolveMarkdownLinkTarget('mailto:hello@example.com')).toEqual({
      url: 'mailto:hello@example.com',
      screen: undefined,
    })
  })
})
