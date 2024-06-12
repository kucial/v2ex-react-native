import { forwardRef, ReactNode, useEffect, useImperativeHandle } from 'react'
import { createContext, useContext, useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { QrCodeIcon, ShareIcon } from 'react-native-heroicons/solid'
import ImageView from 'react-native-image-viewing'
import Share from 'react-native-share'
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner'
import colors from 'tailwindcss/colors'

import { getImageContentUri } from '@/utils/image'

import CheckIcon from '../CheckIcon'
import Loader from '../Loader'

type ImageResource = {
  origin: string
  local?: string
}

export type ImageViewingService = {
  add(info: { origin: string; local?: string }): void
  update(info: { origin: string; local: string }): void
  remove(url: string): void
  open(url: string): void
}

const ServiceContext = createContext<ImageViewingService>(
  {} as ImageViewingService,
)

const ImageViewingFooter = (props: {
  images: ImageResource[]
  imageIndex: number
  handleQrCode(result: BarCodeScannerResult): void
}) => {
  const { images, imageIndex, handleQrCode } = props
  const [saveStatus, setSaveStatus] = useState('')
  const [qrCodes, setQrCodes] = useState(null)
  const displayUri = images[imageIndex]?.local || images[imageIndex]?.origin

  useEffect(() => {
    if (displayUri) {
      BarCodeScanner.scanFromURLAsync(displayUri).then(setQrCodes)
      return () => {
        setQrCodes(null)
      }
    }
  }, [displayUri])

  return (
    <View className="flex flex-row justify-between items-center pb-8 px-8">
      <View>
        <Text className="text-neutral-500">
          {imageIndex + 1} / {images.length}
        </Text>
      </View>
      <View className="flex flex-row gap-x-2">
        {!!qrCodes?.length && (
          <Pressable
            className="w-[32px] h-[32px] bg-neutral-800/50 rounded-full flex justify-center items-center active:opacity-50"
            hitSlop={6}
            onPress={() => {
              handleQrCode(qrCodes[0])
            }}>
            <QrCodeIcon size={16} color={colors.neutral[300]} />
          </Pressable>
        )}
        <Pressable
          className="w-[32px] h-[32px] bg-neutral-800/50 rounded-full flex justify-center items-center active:opacity-50"
          hitSlop={6}
          disabled={saveStatus === 'loading'}
          onPress={async () => {
            try {
              setSaveStatus('loading')
              const contentUri = await getImageContentUri(displayUri)
              setSaveStatus('')
              await Share.open({
                url: contentUri,
              })
              setSaveStatus('success')
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
    handleQrCode(data: BarCodeScannerResult): void
  }
>((props, ref) => {
  const [viewIndex, setViewIndex] = useState(-1)
  const [images, setImages] = useState<ImageResource[]>([])

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
        const index = images.findIndex((item) => item.origin === url)
        setViewIndex(index)
      },
    }
  }, [images])

  const renderImages = useMemo(() => {
    return images.map((item) => ({
      uri: item.local || item.origin,
    }))
  }, [images])

  useImperativeHandle(ref, () => service, [service])

  return (
    <ServiceContext.Provider value={service}>
      {props.children}
      <ImageView
        images={renderImages}
        imageIndex={viewIndex}
        visible={viewIndex > -1}
        onRequestClose={() => setViewIndex(-1)}
        FooterComponent={({ imageIndex }) => (
          <ImageViewingFooter
            key={`index-${imageIndex}`}
            images={images}
            imageIndex={imageIndex}
            handleQrCode={props.handleQrCode}
          />
        )}
      />
    </ServiceContext.Provider>
  )
})

ImageViewingServiceProvider.displayName = 'ImageViewingServiceProvider'

export default ImageViewingServiceProvider

export const useImageViewing = () => useContext(ServiceContext)
