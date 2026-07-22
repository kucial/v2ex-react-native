import * as SecureStore from 'expo-secure-store'

const V2EX_TOKEN_KEY = 'v2ex-personal-token'
const TOKEN_MASK_CHARACTER = '•'

export function maskPersonalToken(token: string): string {
  const cleaned = token.trim()
  if (!cleaned) return ''

  const segments = cleaned.split('-')
  if (segments.length >= 3 && segments.every(Boolean)) {
    return segments
      .map((segment, index) =>
        index === 0 || index === segments.length - 1
          ? segment
          : TOKEN_MASK_CHARACTER.repeat(segment.length),
      )
      .join('-')
  }

  if (cleaned.length <= 12) {
    return TOKEN_MASK_CHARACTER.repeat(cleaned.length)
  }

  const prefixLength = 8
  const suffixLength = 4
  return `${cleaned.slice(0, prefixLength)}${TOKEN_MASK_CHARACTER.repeat(
    cleaned.length - prefixLength - suffixLength,
  )}${cleaned.slice(-suffixLength)}`
}

export async function loadStoredPersonalToken(): Promise<string | null> {
  if (!(await SecureStore.isAvailableAsync())) return null
  return SecureStore.getItemAsync(V2EX_TOKEN_KEY)
}

export async function saveStoredPersonalToken(token: string): Promise<void> {
  if (!(await SecureStore.isAvailableAsync())) {
    throw new Error('此设备无法使用安全凭据存储。')
  }
  await SecureStore.setItemAsync(V2EX_TOKEN_KEY, token, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  })
}

export async function clearStoredPersonalToken(): Promise<void> {
  if (await SecureStore.isAvailableAsync()) {
    await SecureStore.deleteItemAsync(V2EX_TOKEN_KEY)
  }
}
