import { decode } from 'js-base64'

export function getMaxLength(str: string, maxLength = 50) {
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '...'
  }
  return str
}

export function extractBase64Decoded(content: string) {
  const base64Regex =
    /(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})/g

  const output = {}

  const matched = content
    .match(base64Regex)
    ?.map((item) => item.trim())
    .filter((item) => !!item)
  if (!matched) {
    return null
  }

  matched.forEach((item) => {
    if (output[item]) {
      return
    }
    const decoded = decode(item).trim()
    if (/[\x00-\x1F\x7F\x80-\x9F]/.test(decoded) || /�/.test(decoded)) {
      return
    }
    if ((item.length == 4 || item.length == 8) && !/^[\w-_]+$/.test(decoded)) {
      return
    }
    output[item] = decoded
  })

  return Object.entries(output)
}
