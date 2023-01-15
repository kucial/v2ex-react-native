import { createContext, useContext } from 'react'
import { SlateEditorService } from './types'
export const EditorContext = createContext<SlateEditorService>({} as SlateEditorService)
export const useEditor = () => useContext(EditorContext)
