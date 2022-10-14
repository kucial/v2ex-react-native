import { createContext, useContext } from 'react'

const fetched = {}

const ImageDimensionsContext = createContext({
  update: (key, value) => (fetched[key] = value),
  get: (key) => fetched[key]
})

export const ImageDimensionsProvider = (props) => (
  <ImageDimensionsContext.Provider>
    {props.children}
  </ImageDimensionsContext.Provider>
)

export const useCachedImageDimensions = (key) => {
  const service = useContext(ImageDimensionsContext)
  return service.get(key)
}

export const useImageDimensionCache = () => useContext(ImageDimensionsContext)
