export function getMaxLength(str: string, maxLength = 50) {
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + '...'
  }
  return str
}
