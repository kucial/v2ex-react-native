import { forwardRef, ReactNode, useImperativeHandle } from 'react'
import { createContext, useContext, useMemo, useRef, useState } from 'react'
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
  replace(url: string, prev: string): void
  remove(url: string): void
  open(url: string): void
}

class ImageList {
  images: ImageResource[] = []
  add(url: string) {
    const index = this.findIndex(url)
    if (index === -1) {
      this.images.push({ uri: url })
    }
  }
  remove(url: string) {
    this.images = this.images.filter((item) => item.uri !== url)
  }
  replace(url: string, prev: string) {
    const index = this.findIndex(prev)
    if (index > -1) {
      this.images = [
        ...this.images.slice(0, index),
        { uri: url },
        ...this.images.slice(index + 1),
      ]
    } else {
      this.images.push({ uri: url })
    }
  }
  findIndex(url: string) {
    const index = this.images.findIndex((item) => item.uri === url)
    return index
  }
  get(index: number) {
    return this.images[index]
  }
  count() {
    return this.images.length
  }
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
              console.log(image.uri, contentUri)
              const result = await Share.share({
                url: contentUri,
              })
              if (result.action === 'dismissedAction') {
                setSaveStatus('')
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
  const imageList = useRef<ImageList>(new ImageList())

  const service = useMemo(() => {
    return {
      add: (url: string) => {
        imageList.current.add(url)
      },
      remove: (url: string) => {
        imageList.current.remove(url)
      },
      open: (url: string) => {
        const index = imageList.current.findIndex(url)
        setViewIndex(index)
      },
      replace: (url: string, prev: string) => {
        imageList.current.replace(url, prev)
      },
    } as ImageViewingService
  }, [])

  useImperativeHandle(ref, () => service, [service])

  return (
    <ServiceContext.Provider value={service}>
      {props.children}
      <ImageView
        images={imageList.current.images}
        imageIndex={viewIndex}
        visible={viewIndex > -1}
        onRequestClose={() => setViewIndex(-1)}
        FooterComponent={({ imageIndex }) => (
          <ImageViewingFooter
            key={`index-${imageIndex}`}
            images={imageList.current.images}
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
