import { useContext } from 'react'
import { createContext } from 'react'

import { ImgurImage } from '@/containers/ImgurService/types'

type Route = { name: string; params: Record<string, any> }
type PickerContextType = {
  stack: Route[]
  current: Route
  selected: ImgurImage[]
  toggleImage: (image: ImgurImage) => void
  submit: () => void
}

export const PickerContext = createContext<PickerContextType>(null)

export const usePickerContext = () => useContext(PickerContext)

export const useAlbum = () => {
  const { current } = usePickerContext()
  return current.params?.album
}
