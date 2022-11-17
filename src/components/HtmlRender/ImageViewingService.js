import { forwardRef, useImperativeHandle } from 'react'
import { createContext, useContext, useMemo, useRef, useState } from 'react'
import { Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import ImageView from 'react-native-image-viewing'

const ServiceContext = createContext()

const ImageViewingService = forwardRef((props, ref) => {
  const [viewIndex, setViewIndex] = useState(-1)
  const imagesRef = useRef([])

  const service = useMemo(() => {
    return {
      add: (url) => {
        const index = imagesRef.current.findIndex((n) => n.url === url)
        if (index === -1) {
          imagesRef.current = [...imagesRef.current, { url }]
        }
      },
      remove: (url) => {
        imagesRef.current = imagesRef.current.filter((item) => item.url !== url)
      },
      open: (url) => {
        const index = imagesRef.current.findIndex((n) => n.url === url)
        setViewIndex(index)
      },
    }
  }, [])

  useImperativeHandle(ref, () => service, [service])

  return (
    <ServiceContext.Provider value={service}>
      {props.children}
      <ImageView
        images={imagesRef.current.map((item) => ({ uri: item.url }))}
        imageIndex={viewIndex}
        visible={viewIndex > -1}
        onRequestClose={() => setViewIndex(-1)}
        CustomImageComponent={FastImage}
        FooterComponent={({ imageIndex }) => (
          <View className="flex flex-row justify-center items-center pb-5">
            <Text className="text-neutral-500">
              {imageIndex + 1} / {imagesRef.current.length}
            </Text>
          </View>
        )}
      />
    </ServiceContext.Provider>
  )
})

ImageViewingService.displayName = 'ImageViewingService'

export default ImageViewingService

export const useImageViewing = () => useContext(ServiceContext)
