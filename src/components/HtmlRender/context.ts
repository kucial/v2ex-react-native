import { createContext } from 'react'
type RenderContextType = {
  handleUrlPress: (args: {
    interaction: 'default' | 'preview' | 'default'
    url: string
  }) => void,
  handleSelection: (args: {
    eventType: string,
    content: string,
  }) => void,
  menuItems: string[],
}

export const RenderContext = createContext<RenderContextType>({} as RenderContextType)
export const SelectableTextAncestor = createContext(false)
