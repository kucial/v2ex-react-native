import * as Updates from 'expo-updates'

import { getJSON, setJSON } from '@/utils/storage'

export const UPDATE_CHANNELS = ['production', 'preview'] as const
export type UpdateChannel = (typeof UPDATE_CHANNELS)[number]

const UPDATE_CHANNEL_KEY = '$app$/expo-update-channel'

function isUpdateChannel(value: unknown): value is UpdateChannel {
  return UPDATE_CHANNELS.includes(value as UpdateChannel)
}

export function getSelectedUpdateChannel(): UpdateChannel {
  const stored = getJSON(UPDATE_CHANNEL_KEY)
  if (isUpdateChannel(stored)) return stored
  return isUpdateChannel(Updates.channel) ? Updates.channel : 'production'
}

function applyChannelOverride(channel: UpdateChannel) {
  Updates.setUpdateRequestHeadersOverride(
    channel === Updates.channel ? null : { 'expo-channel-name': channel },
  )
}

export async function switchUpdateChannel(channel: UpdateChannel) {
  if (__DEV__ || !Updates.isEnabled) {
    throw new Error('更新频道只能在启用 OTA 的发布版本中切换。')
  }

  const previousChannel = getSelectedUpdateChannel()
  applyChannelOverride(channel)

  try {
    const update = await Updates.checkForUpdateAsync()
    setJSON(UPDATE_CHANNEL_KEY, channel)

    if (!update.isAvailable) {
      return { updateAvailable: false }
    }

    await Updates.fetchUpdateAsync()
    await Updates.reloadAsync({
      reloadScreenOptions: {
        backgroundColor: '#111111',
        spinner: { enabled: true, size: 'large' },
        fade: true,
      },
    })
    return { updateAvailable: true }
  } catch (error) {
    applyChannelOverride(previousChannel)
    setJSON(UPDATE_CHANNEL_KEY, previousChannel)
    throw error
  }
}
