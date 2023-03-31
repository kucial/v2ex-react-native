import { createContext } from 'react'

import { AppSettingsService } from './types'

export const AppSettingsContext = createContext<AppSettingsService>(
  {} as AppSettingsService,
)
