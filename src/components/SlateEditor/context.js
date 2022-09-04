import { useContext, createContext } from 'react'

export const EditorContext = createContext({})
export const useEditor = () => useContext(EditorContext)
