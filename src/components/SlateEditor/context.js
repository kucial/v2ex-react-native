import { createContext, useContext } from 'react'

export const EditorContext = createContext({})
export const useEditor = () => useContext(EditorContext)
