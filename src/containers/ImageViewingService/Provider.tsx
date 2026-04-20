import {
  createContext,
  forwardRef,
  ReactNode,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { BarcodeScanningResult } from 'expo-camera'

import { useGlobalImageViewing } from './store'
import type { ImageResource, ImageViewingService } from './types'

const ServiceContext = createContext<ImageViewingService>(
  {} as ImageViewingService,
)

const ImageViewingServiceProvider = forwardRef<
  ImageViewingService,
  {
    children: ReactNode
    handleQrCode(data: BarcodeScanningResult): void
  }
>((props, ref) => {
  const [images, setImages] = useState<ImageResource[]>([])

  const imagesRef = useRef<ImageResource[]>([])
  useEffect(() => {
    imagesRef.current = images
  }, [images])

  const service: ImageViewingService = useMemo(() => {
    return {
      add: (info) => {
        setImages((prev) => {
          const index = prev.findIndex((item) => item.origin === info.origin)
          if (index === -1) {
            return [...prev, info]
          }
          return prev
        })
      },
      update: (info) => {
        setImages((prev) => {
          const index = prev.findIndex((item) => item.origin === info.origin)
          return [...prev.slice(0, index), info, ...prev.slice(index + 1)]
        })
      },
      remove: (url: string) => {
        setImages((prev) => prev.filter((item) => item.origin !== url))
      },
      open: (url: string) => {
        const index = imagesRef.current.findIndex((item) => item.origin === url)
        useGlobalImageViewing
          .getState()
          .open(index, imagesRef.current, props.handleQrCode)
      },
    }
  }, [props.handleQrCode])

  useImperativeHandle(ref, () => service, [service])

  return (
    <ServiceContext.Provider value={service}>
      {props.children}
    </ServiceContext.Provider>
  )
})

ImageViewingServiceProvider.displayName = 'ImageViewingServiceProvider'

export default ImageViewingServiceProvider

export const useImageViewing = () => useContext(ServiceContext)
