import { createContext } from 'react'

type AppLayoutContext = {
  // pageNav: null
  setPageNav(element: any): void
}
export const AppLayoutContext = createContext<AppLayoutContext>(null)
