/// <reference types='jest' />

import * as SecureStore from 'expo-secure-store'

import {
  clearStoredPersonalToken,
  loadStoredPersonalToken,
  maskPersonalToken,
  saveStoredPersonalToken,
} from '@/lib/ai-chat/token-store'

jest.mock('expo-secure-store', () => ({
  isAvailableAsync: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'device-only',
}))

const isAvailable = SecureStore.isAvailableAsync as jest.MockedFunction<
  typeof SecureStore.isAvailableAsync
>
const getItem = SecureStore.getItemAsync as jest.MockedFunction<
  typeof SecureStore.getItemAsync
>
const setItem = SecureStore.setItemAsync as jest.MockedFunction<
  typeof SecureStore.setItemAsync
>
const deleteItem = SecureStore.deleteItemAsync as jest.MockedFunction<
  typeof SecureStore.deleteItemAsync
>

describe('V2EX token masking', () => {
  it('preserves the first and last UUID segments', () => {
    expect(maskPersonalToken('9822568a-1234-5678-9abc-d25a391a26ce')).toBe(
      '9822568a-••••-••••-••••-d25a391a26ce',
    )
  })

  it('masks short and non-segmented tokens', () => {
    expect(maskPersonalToken('secret')).toBe('••••••')
    expect(maskPersonalToken('abcdefgh1234567890wxyz')).toBe(
      'abcdefgh••••••••••wxyz',
    )
    expect(maskPersonalToken('  ')).toBe('')
  })
})

describe('V2EX token secure storage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    isAvailable.mockResolvedValue(true)
  })

  it('loads and saves a device-bound token', async () => {
    getItem.mockResolvedValue('secret')
    await expect(loadStoredPersonalToken()).resolves.toBe('secret')
    await saveStoredPersonalToken('new-secret')
    expect(setItem).toHaveBeenCalledWith('v2ex-personal-token', 'new-secret', {
      keychainAccessible: 'device-only',
    })
  })

  it('clears a saved token and rejects unavailable storage', async () => {
    await clearStoredPersonalToken()
    expect(deleteItem).toHaveBeenCalledWith('v2ex-personal-token')

    isAvailable.mockResolvedValue(false)
    await expect(saveStoredPersonalToken('secret')).rejects.toThrow(
      '此设备无法使用安全凭据存储。',
    )
  })
})
