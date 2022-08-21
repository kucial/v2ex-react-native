import { useContext } from 'react'
import { createContext } from 'react'

export const AlbumContext = createContext(null)

export const useAlbum = () => useContext(AlbumContext)
