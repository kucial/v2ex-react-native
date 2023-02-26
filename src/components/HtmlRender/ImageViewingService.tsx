import { forwardRef, ReactNode, useImperativeHandle } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'
import { Pressable, Share, Text, View } from 'react-native'
import { ShareIcon } from 'react-native-heroicons/solid'
import ImageView from 'react-native-image-viewing'
import colors from 'tailwindcss/colors'

import { getImageContentUri } from '@/utils/image'

import CheckIcon from '../CheckIcon'
import Loader from '../Loader'

type ImageResource = {
  uri: string
}

export type ImageViewingService = {
  add(url: string): void
  replace(url: string, prevUrl: string): void
  remove(url: string): void
  open(url: string): void
}

const ServiceContext = createContext<ImageViewingService>(
  {} as ImageViewingService,
)

const ImageViewingFooter = (props: {
  images: ImageResource[]
  imageIndex: number
}) => {
  const { images, imageIndex } = props
  const [saveStatus, setSaveStatus] = useState('')

  return (
    <View className="flex flex-row justify-between items-center pb-8 px-8">
      <View>
        <Text className="text-neutral-500">
          {imageIndex + 1} / {images.length}
        </Text>
      </View>
      <View>
        <Pressable
          className="w-[32px] h-[32px] bg-neutral-800/50 rounded-full flex justify-center items-center active:opacity-50"
          hitSlop={6}
          disabled={saveStatus === 'loading'}
          onPress={async () => {
            try {
              const image = images[imageIndex]
              setSaveStatus('loading')
              const contentUri = await getImageContentUri(image.uri)
              setSaveStatus('')
              const result = await Share.share({
                url: contentUri,
              })
              if (result.action === 'dismissedAction') {
                // no nothing
              } else {
                // NOTE: dropdown-alert does not work. for z-index info
                setSaveStatus('success')
              }
            } catch (err) {
              console.log(err)
              setSaveStatus('')
            }
          }}>
          {saveStatus === '' && (
            <ShareIcon size={14} color={colors.neutral[300]} />
          )}
          {saveStatus === 'loading' && (
            <Loader size={14} color={colors.neutral[300]} />
          )}
          {saveStatus === 'success' && (
            <CheckIcon size={16} color={colors.neutral[300]} />
          )}
        </Pressable>
      </View>
    </View>
  )
}

const ImageViewingServiceProvider = forwardRef<
  ImageViewingService,
  {
    children: ReactNode
  }
>((props, ref) => {
  const [viewIndex, setViewIndex] = useState(-1)
  const [images, setImages] = useState<ImageResource[]>([])

  const service: ImageViewingService = useMemo(() => {
    return {
      add: (url: string) => {
        setImages((prev) => {
          const index = prev.findIndex((item) => item.uri === url)
          if (index === -1) {
            return [...prev, { uri: url }]
          }
          return prev
        })
      },
      remove: (url: string) => {
        setImages((prev) => prev.filter((item) => item.uri !== url))
      },
      open: (url: string) => {
        const index = images.findIndex((item) => item.uri === url)
        setViewIndex(index)
      },
      replace: (url: string, prevUrl: string) => {
        setImages((prev) => {
          const index = prev.findIndex((item) => item.uri === prevUrl)
          if (index > -1) {
            return [
              ...prev.slice(0, index),
              { uri: url },
              ...prev.slice(index + 1),
            ]
          } else {
            return [...prev, { uri: url }]
          }
        })
      },
    }
  }, [images])

  useImperativeHandle(ref, () => service, [service])

  return (
    <ServiceContext.Provider value={service}>
      {props.children}
      <ImageView
        images={images}
        imageIndex={viewIndex}
        visible={viewIndex > -1}
        onRequestClose={() => setViewIndex(-1)}
        FooterComponent={({ imageIndex }) => (
          <ImageViewingFooter
            key={`index-${imageIndex}`}
            images={images}
            imageIndex={imageIndex}
          />
        )}
      />
    </ServiceContext.Provider>
  )
})

ImageViewingServiceProvider.displayName = 'ImageViewingServiceProvider'

export default ImageViewingServiceProvider

export const useImageViewing = () => useContext(ServiceContext)
