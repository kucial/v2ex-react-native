import { useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { QrCodeIcon, ShareIcon } from 'react-native-heroicons/solid'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Share from 'react-native-share'
import { BarcodeScanningResult, Camera } from 'expo-camera'

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
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (displayUri) {
      Camera.scanFromURLAsync(displayUri, ['qr']).then(setQrCodes)
      return () => {
        setQrCodes(null)
      }
    }
  }, [displayUri])

  return (
    <View style={{ paddingBottom: insets.bottom }}>
      <View style={modalStyles.footerRow}>
        <View>
          <Text style={modalStyles.counterText}>
            {imageIndex + 1} / {images.length}
          </Text>
        </View>
        <View style={modalStyles.btnGroup}>
          {!!(qrCodes?.length && handleQrCode) && (
            <Pressable
              style={({ pressed }) => [
                modalStyles.iconBtn,
                pressed && modalStyles.pressed,
              ]}
              hitSlop={6}
              onPress={() => {
                handleQrCode(qrCodes[0])
              }}
            >
              <QrCodeIcon size={16} color='#d4d4d4' />
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [
              modalStyles.iconBtn,
              pressed && modalStyles.pressed,
            ]}
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
            {saveStatus === '' && <ShareIcon size={14} color='#d4d4d4' />}
            {saveStatus === 'loading' && <Loader size={14} color='#d4d4d4' />}
            {saveStatus === 'success' && (
              <CheckIcon size={16} color='#d4d4d4' />
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

const modalStyles = StyleSheet.create({
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  counterText: {
    color: '#737373',
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(38, 38, 38, 0.5)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
})
