import { createContext, useContext } from 'react'
import { ViewStyle } from 'react-native'

export const LayoutStyleContext = createContext<ViewStyle>(null)
export const useLayoutStyle = () => useContext(LayoutStyleContext)
