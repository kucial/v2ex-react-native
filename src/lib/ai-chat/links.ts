import { getScreenInfo, isAppLink } from '@/utils/url'

const V2EX_WEB_ORIGIN = 'https://www.v2ex.com'
const EXPLICIT_SCHEME = /^[a-z][a-z\d+.-]*:/i

export function resolveMarkdownLink(rawUrl: string): string {
  const url = rawUrl.trim()
  if (url.toLowerCase().startsWith('file:')) {
    try {
      const parsed = new URL(url)
      return new URL(
        `${parsed.pathname}${parsed.search}${parsed.hash}`,
        V2EX_WEB_ORIGIN,
      ).toString()
    } catch {
      return V2EX_WEB_ORIGIN
    }
  }
  if (url.startsWith('//')) return `https:${url}`
  if (EXPLICIT_SCHEME.test(url)) return url
  return new URL(url || '/', `${V2EX_WEB_ORIGIN}/`).toString()
}

export function resolveMarkdownLinkTarget(rawUrl: string) {
  const url = resolveMarkdownLink(rawUrl)
  return {
    url,
    screen: isAppLink(url) ? getScreenInfo(url) : undefined,
  }
}
