import { createContext, ReactNode, useContext } from 'react'

type ImageDimension = {
  width: number
  height: number
}
const cache: Record<string, ImageDimension> = {}

const service = {
  update: (key: string, value: ImageDimension) => (cache[key] = value),
  get: (key: string) => cache[key],
}

const ImageDimensionsContext = createContext(service)

export const ImageDimensionsProvider = (props: { children: ReactNode }) => (
  <ImageDimensionsContext.Provider value={service}>
    {props.children}
  </ImageDimensionsContext.Provider>
)

export const useCachedImageDimensions = (key: string) => {
  const service = useContext(ImageDimensionsContext)
  return service.get(key)
}

export const useImageDimensionCache = () => useContext(ImageDimensionsContext)
