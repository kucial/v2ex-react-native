import { useContext, useMemo } from 'react'
import { useWindowDimensions } from 'react-native'
import * as Device from 'expo-device'

import { AppSettingsContext } from './context'

export const useAppSettings = () => useContext(AppSettingsContext)

type PadLayoutInfo = {
  active: boolean
  orientation: 'PORTRAIT' | 'LANDSCAPE'
}
export const usePadLayout = () => {
  const { data } = useAppSettings()
  const { width, height } = useWindowDimensions()

  const info = useMemo(() => {
    return {
      active:
        data.payLayoutEnabled && Device.deviceType === Device.DeviceType.TABLET,
      orientation: height > width ? 'PORTRAIT' : 'LANDSCAPE',
    }
  }, [data.payLayoutEnabled, width, height])

  return info as PadLayoutInfo
}
