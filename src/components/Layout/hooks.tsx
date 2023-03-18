import { useContext } from 'react'

import { AppLayoutContext } from './context'
export const useAppLayout = () => {
  return useContext(AppLayoutContext)
}
