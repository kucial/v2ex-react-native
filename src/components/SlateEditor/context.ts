import type { RefObject } from 'react'
import { createContext, useContext } from 'react'

import { SlateEditorService } from './types'

// Extended service that also carries the DOM bridge refs
// used internally by EditorRender
export type SlateEditorContextValue = SlateEditorService & {
  domRef: RefObject<any>
  handleEvent: (event: any) => void
}

export const EditorContext = createContext<SlateEditorContextValue>(
  {} as SlateEditorContextValue,
)
export const useEditor = () => useContext(EditorContext)
