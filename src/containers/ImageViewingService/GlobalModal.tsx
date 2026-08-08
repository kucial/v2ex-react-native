import { useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Share from 'react-native-share'
import { BarcodeScanningResult, Camera } from 'expo-camera'

import CheckIcon from '@/components/CheckIcon'
import V2exIcon from '@/components/icons/V2exIcon'
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
    if (!displayUri) {
      return
    }
    let current = true
    Camera.scanFromURLAsync(displayUri, ['qr'])
      .then((results) => {
        if (current) {
          setQrCodes(results)
        }
      })
      // Scanning fails for anything the OS can't decode into an image, and
      // for remote images it couldn't fetch. That just means "no QR code
      // here" — it is not worth reporting, and an unhandled rejection sends
      // it to Sentry (V2EX-REACT-NATIVE-EC).
      .catch(() => {
        if (current) {
          setQrCodes(null)
        }
      })
    return () => {
      // Swiping to the next image while a scan is in flight would otherwise
      // let the stale result land on the new image.
      current = false
      setQrCodes(null)
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
              <V2exIcon name='qr-code-solid' size={16} color='#d4d4d4' />
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [
              modalStyles.iconBtn,
              pressed && modalStyles.pressed,
            ]}
            hitSlop={6}
            disabled={saveStatus === 'loading' || !displayUri}
            onPress={async () => {
              if (!displayUri) {
                return
              }
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
              <V2exIcon name='share-solid' size={14} color='#d4d4d4' />
            )}
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

  const hasImages = renderImages.length > 0
  const safeViewIndex = hasImages
    ? Math.min(Math.max(viewIndex, 0), renderImages.length - 1)
    : 0

  return (
    <ImageViewing
      images={renderImages}
      imageIndex={safeViewIndex}
      visible={visible && viewIndex > -1 && hasImages}
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
