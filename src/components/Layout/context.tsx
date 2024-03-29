import { createContext, useContext } from 'react'
import { ViewStyle } from 'react-native'

type AppLayoutContext = {
  // pageNav: null
  setPageNav(element: any): void
}
export const AppLayoutContext = createContext<AppLayoutContext>(null)
export const LayoutStyleContext = createContext<ViewStyle>(null)
export const useLayoutStyle = () => useContext(LayoutStyleContext)
