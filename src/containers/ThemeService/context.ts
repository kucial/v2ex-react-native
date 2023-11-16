import { createContext } from 'react'

import { getThemeService } from './helpers'
import { ThemeService } from './types'

export const ThemeContext = createContext<ThemeService>(getThemeService())
