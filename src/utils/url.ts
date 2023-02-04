const hrefMap = {
  'https://(?:\\w+\\.)?v2ex.com/t/(\\d+)(?:\\?p=\\d+)?(#\\w+)?$': (
    match: RegExpExecArray,
  ) => ({
    name: 'topic',
    params: {
      id: match[1],
    },
  }),
  'https://(?:\\w+\\.)?v2ex\\.com/member/([^/]+)(?:/(topics|replies))?$': (
    match: RegExpExecArray,
  ) => ({
    name: 'member',
    params: {
      username: match[1],
      tab: match[2],
    },
  }),
  'https://(?:\\w+\\.)?v2ex.com/go/([\\w_]*)?$': (match: RegExpExecArray) => ({
    name: 'node',
    params: {
      name: match[1],
    },
  }),
}

type TopicScreenInfo = {
  name: 'topic'
  params: {
    id: number
  }
}
type MemberScreenInfo = {
  name: 'member'
  params: {
    username: string
    tab: string
  }
}
type NodeScreenInfo = {
  name: 'node'
  params: {
    name: string
  }
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
  return /^https?:\/\/(?:\w+\.)?v2ex.com/.test(href)
}

export const isImgurResourceLink = (href: string) => {
  return /^https?:\/\/imgur\.com\/[^/]+$/.test(href)
}

export const getImgurResourceImageLink = (href: string) => {
  return href.replace(
    /^https?:\/\/imgur\.com\/([^/]+)$/,
    'https://i.imgur.com/$1.png',
  )
}
