import { useMemo } from 'react'
import { useWindowDimensions } from 'react-native'
import * as Device from 'expo-device'

import { useAppSettingsStore } from '@/stores/appSettings'

export const useAppSettings = () => useAppSettingsStore((state) => state)

export const useSearchProvider = () =>
  useAppSettingsStore((state) => state.data.searchProvider)

export const useMaxContainerWidth = () =>
  useAppSettingsStore((state) => state.data.maxContainerWidth)

type PadLayoutInfo = {
  active: boolean
  orientation: 'PORTRAIT' | 'LANDSCAPE'
}
export const usePadLayout = () => {
  const payLayoutEnabled = useAppSettingsStore(
    (state) => state.data.payLayoutEnabled,
  )
  const { width, height } = useWindowDimensions()

  const info = useMemo(() => {
    return {
      active:
        payLayoutEnabled && Device.deviceType === Device.DeviceType.TABLET,
      orientation: height > width ? 'PORTRAIT' : 'LANDSCAPE',
    }
  }, [payLayoutEnabled, width, height])

  return info as PadLayoutInfo
}
