import { forwardRef, useImperativeHandle } from 'react'
import { createContext, useContext, useMemo, useRef, useState } from 'react'
import { Pressable, Share, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { ShareIcon } from 'react-native-heroicons/solid'
import ImageView from 'react-native-image-viewing'
import * as FileSystem from 'expo-file-system'
import colors from 'tailwindcss/colors'

import { useAlertService } from '@/containers/AlertService'

const ServiceContext = createContext()

function getImgXtension(uri, fallback) {
  var basename = uri.split(/[\\/]/).pop()
  return /[.]/.exec(basename) ? /[^.]+$/.exec(basename) : fallback
}

// NO
async function downloadImage(url) {
  const downloadImage = FileSystem.createDownloadResumable(
    url,
    FileSystem.cacheDirectory +
      'TMP_' +
      Date.now() +
      '.' +
      getImgXtension(url, 'png'),
  )
  return await downloadImage.downloadAsync()
}

const ImageViewingService = forwardRef((props, ref) => {
  const [viewIndex, setViewIndex] = useState(-1)
  const imagesRef = useRef([])
  const alert = useAlertService()

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
          <View className="flex flex-row justify-between items-center pb-8 px-8">
            <View>
              <Text className="text-neutral-500">
                {imageIndex + 1} / {imagesRef.current.length}
              </Text>
            </View>
            <View>
              <Pressable
                className="w-[32px] h-[32px] bg-neutral-800/50 rounded-full flex justify-center items-center active:opacity-50"
                hitSlop={6}
                onPress={async () => {
                  try {
                    const downloaded = await downloadImage(
                      imagesRef.current[imageIndex]?.url,
                    )
                    const result = await Share.share({
                      url: downloaded.uri,
                    })
                    // if (
                    //   result.activityType ===
                    //   'com.apple.UIKit.activity.SaveToCameraRoll'
                    // ) {
                    //   alert.alertWithType('success', '成功', '已保存到相册')
                    // }
                    await FileSystem.deleteAsync(downloaded.uri)
                    console.log(result)
                  } catch (err) {
                    console.log(err)
                  }
                }}>
                <ShareIcon size={14} color={colors.neutral[300]} />
              </Pressable>
            </View>
          </View>
        )}
      />
    </ServiceContext.Provider>
  )
})

ImageViewingService.displayName = 'ImageViewingService'

export default ImageViewingService

export const useImageViewing = () => useContext(ServiceContext)
