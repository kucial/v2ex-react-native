const hrefMap = {
  'https?://(?:\\w+\\.)?v2ex.com/t/(\\d+)(?:\\?p=\\d+)?(#\\w+)?$': (
    match: RegExpExecArray,
  ) => ({
    name: 'topic',
    params: {
      id: match[1],
    },
  }),
  'https?://(?:\\w+\\.)?v2ex\\.com/member/([^/]+)(?:/(topics|replies))?$': (
    match: RegExpExecArray,
  ) => ({
    name: 'member',
    params: {
      username: match[1],
      tab: match[2],
    },
  }),
  'https?://(?:\\w+\\.)?v2ex.com/go/([\\w_]*)?$': (match: RegExpExecArray) => ({
    name: 'node',
    params: {
      name: match[1],
    },
  }),
}

type TopicScreenInfo = {
  name: 'topic'
  params: AppStackParamList['topic']
}
type MemberScreenInfo = {
  name: 'member'
  params: AppStackParamList['member']
}

type NodeScreenInfo = {
  name: 'node'
  params: AppStackParamList['node']
}

type ScreenInfo =
  | TopicScreenInfo
  | MemberScreenInfo
  | NodeScreenInfo
  | undefined

export const getScreenInfo = (href: string): ScreenInfo => {
  let screen
  Object.entries(hrefMap).some(([regexStr, screenInfo]) => {
    const match = new RegExp(regexStr).exec(href)
    if (match) {
      screen = screenInfo(match)
      return true
    }
    return false
  })
  return screen
}

export const isAppLink = (href: string) => {
  return /^https?:\/\/(?:\w+\.)?v2ex\.com/.test(href)
}

export const isImgurResourceLink = (href: string) => {
  return /^https?:\/\/(i\.)?imgur\.com\/[^/]+$/.test(href)
}

export const getImgurResourceImageLink = (href: string) => {
  return href.replace(
    /^https?:\/\/(?:i\.)?imgur\.com\/([^/.]+)?(\.[png|gif|jpeg])?$/,
    'https://i.imgur.com/$1.png',
  )
}

export function isURL(str: string) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i', // fragment locator
  )
  return pattern.test(str)
}

export function isDeepLink(str) {
  const pattern = new RegExp(
    '^[a-z][a-z0-9+.-]*://(?:[a-z\\d-]+\\.)+[a-z]{2,6}(?:/[^#?]+)?(?:\\?[^#]*)?(?:#\\w*)?$',
    'i',
  )
  return pattern.test(str)
}

export function tailingFix(str: string) {
  return str.replace(/(?:[)\],;。，；]).*$/, '')
}
