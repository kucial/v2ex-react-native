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

  const result = content
    .match(base64Regex)
    ?.map((item) => item.trim())
    .filter((item) => !!item)
    .map((str) => [str, decode(str).trim()])
    .filter((item) => !/�/.test(item[1]))

  return result
}
