import { useContext, useMemo } from 'react'
import { useWindowDimensions } from 'react-native'

import { APP_SIDEBAR_SIZE } from '../../constants'
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
        data.payLayoutEnabled &&
        width > data.maxContainerWidth + APP_SIDEBAR_SIZE,
      orientation: height > width ? 'PORTRAIT' : 'LANDSCAPE',
    }
  }, [data.payLayoutEnabled, data.maxContainerWidth, width, height])

  return info as PadLayoutInfo
}
