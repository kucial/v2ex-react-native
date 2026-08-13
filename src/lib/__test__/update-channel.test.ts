const mockGetJSON = jest.fn()
const mockSetJSON = jest.fn()
const mockSetHeaders = jest.fn()
const mockCheck = jest.fn()
const mockFetch = jest.fn()
const mockReload = jest.fn()

jest.mock('@/utils/storage', () => ({
  getJSON: (...args: unknown[]) => mockGetJSON(...args),
  setJSON: (...args: unknown[]) => mockSetJSON(...args),
}))

jest.mock('expo-updates', () => ({
  channel: 'production',
  isEnabled: true,
  setUpdateRequestHeadersOverride: (...args: unknown[]) =>
    mockSetHeaders(...args),
  checkForUpdateAsync: () => mockCheck(),
  fetchUpdateAsync: () => mockFetch(),
  reloadAsync: (...args: unknown[]) => mockReload(...args),
}))

import {
  getSelectedUpdateChannel,
  switchUpdateChannel,
} from '@/lib/update-channel'

describe('update channel switching', () => {
  const originalDev = global.__DEV__

  beforeAll(() => {
    Object.defineProperty(global, '__DEV__', {
      configurable: true,
      value: false,
    })
  })

  afterAll(() => {
    Object.defineProperty(global, '__DEV__', {
      configurable: true,
      value: originalDev,
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetJSON.mockReturnValue(undefined)
  })

  it('uses the embedded production channel by default', () => {
    expect(getSelectedUpdateChannel()).toBe('production')
  })

  it('rejects development builds before calling the native override', async () => {
    Object.defineProperty(global, '__DEV__', {
      configurable: true,
      value: true,
    })

    await expect(switchUpdateChannel('preview')).rejects.toThrow(
      '更新频道只能在启用 OTA 的发布版本中切换。',
    )
    expect(mockSetHeaders).not.toHaveBeenCalled()

    Object.defineProperty(global, '__DEV__', {
      configurable: true,
      value: false,
    })
  })

  it('persists a preview override without reloading when no update exists', async () => {
    mockCheck.mockResolvedValue({ isAvailable: false })

    await expect(switchUpdateChannel('preview')).resolves.toEqual({
      updateAvailable: false,
    })
    expect(mockSetHeaders).toHaveBeenCalledWith({
      'expo-channel-name': 'preview',
    })
    expect(mockSetJSON).toHaveBeenCalledWith(
      '$app$/expo-update-channel',
      'preview',
    )
    expect(mockReload).not.toHaveBeenCalled()
  })

  it('downloads and reloads when the selected channel has an update', async () => {
    mockCheck.mockResolvedValue({ isAvailable: true })
    mockFetch.mockResolvedValue({ isNew: true })
    mockReload.mockResolvedValue(undefined)

    await switchUpdateChannel('preview')

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockReload).toHaveBeenCalledTimes(1)
  })

  it('restores the previous channel when checking fails', async () => {
    mockCheck.mockRejectedValue(new Error('offline'))

    await expect(switchUpdateChannel('preview')).rejects.toThrow('offline')
    expect(mockSetHeaders).toHaveBeenLastCalledWith(null)
    expect(mockSetJSON).toHaveBeenLastCalledWith(
      '$app$/expo-update-channel',
      'production',
    )
  })
})
