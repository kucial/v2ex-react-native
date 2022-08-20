const hrefMap = {
  'https://(?:www\\.)?v2ex.com/t/(\\d+)(#\\w+)?$': (match) => ({
    name: 'topic',
    params: {
      id: match[1]
    }
  }),
  'https://(?:www\\.)?v2ex.com/member/(.*)$': (match) => ({
    name: 'member',
    params: {
      username: match[1]
    }
  }),
  'https://(?:www\\.)?v2ex.com/go/([\\w_]*)?$': (match) => ({
    name: 'node',
    params: {
      name: match[1]
    }
  })
}

export const getScreenInfo = (href) => {
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

export const isAppLink = (href) => {
  return /^https:\/\/(?:www\.)?v2ex.com/.test(href)
}
