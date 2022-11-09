import { createContext } from 'react'
export const RenderContext = createContext({
  handleUrlPress: (url) => {
    console.log('TO HANDLE URL: %s', url)
  }
})
export const SelectableTextAncestor = createContext(false)
