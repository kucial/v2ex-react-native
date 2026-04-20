import { useEffect, useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { QrCodeIcon, ShareIcon } from 'react-native-heroicons/solid'
import Share from 'react-native-share'
import { BarcodeScanningResult, Camera } from 'expo-camera'
import colors from 'tailwindcss/colors'

import CheckIcon from '@/components/CheckIcon'
import { ImageViewing } from '@/components/ImageViewing'
import Loader from '@/components/Loader'

import { useGlobalImageViewing } from './store'
import type { ImageResource } from './types'

const ImageViewingFooter = (props: {
  images: ImageResource[]
  imageIndex: number
  handleQrCode?: (result: BarcodeScanningResult) => void
}) => {
  const { images, imageIndex, handleQrCode } = props
  const [saveStatus, setSaveStatus] = useState('')
  const [qrCodes, setQrCodes] = useState<BarcodeScanningResult[] | null>(null)
  const displayUri = images[imageIndex]?.local || images[imageIndex]?.origin

  useEffect(() => {
    if (displayUri) {
      Camera.scanFromURLAsync(displayUri, ['qr']).then(setQrCodes)
      return () => {
        setQrCodes(null)
      }
    }
  }, [displayUri])

  return (
    <View className='pb-safe'>
      <View className='flex flex-row justify-between items-center px-8'>
        <View>
          <Text className='text-neutral-500'>
            {imageIndex + 1} / {images.length}
          </Text>
        </View>
        <View className='flex flex-row gap-x-2'>
          {!!(qrCodes?.length && handleQrCode) && (
            <Pressable
              className='w-[32px] h-[32px] bg-neutral-800/50 rounded-full flex justify-center items-center active:opacity-50'
              hitSlop={6}
              onPress={() => {
                handleQrCode(qrCodes[0])
              }}
            >
              <QrCodeIcon size={16} color={colors.neutral[300]} />
            </Pressable>
          )}
          <Pressable
            className='w-[32px] h-[32px] bg-neutral-800/50 rounded-full flex justify-center items-center active:opacity-50'
            hitSlop={6}
            disabled={saveStatus === 'loading'}
            onPress={async () => {
              try {
                setSaveStatus('loading')
                setSaveStatus('')
                await Share.open({
                  url: displayUri,
                })
                setSaveStatus('success')
              } catch (err) {
                console.log(err)
                setSaveStatus('')
              }
            }}
          >
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
    </View>
  )
}

export function GlobalImageViewingModal() {
  const { visible, viewIndex, images, handleQrCode, close } =
    useGlobalImageViewing()

  const renderImages = useMemo(() => {
    return images.map((item) => ({
      uri: item.local || item.origin,
    }))
  }, [images])

  return (
    <ImageViewing
      images={renderImages}
      imageIndex={viewIndex}
      visible={visible && viewIndex > -1}
      onRequestClose={close}
      FooterComponent={({ imageIndex }) => (
        <ImageViewingFooter
          key={`index-${imageIndex}`}
          images={images}
          imageIndex={imageIndex}
          handleQrCode={handleQrCode}
        />
      )}
    />
  )
}
