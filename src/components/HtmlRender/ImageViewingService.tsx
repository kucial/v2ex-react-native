import { forwardRef, ReactNode, useImperativeHandle } from 'react'
import { createContext, useContext, useMemo, useRef, useState } from 'react'
import { Pressable, Share, Text, View } from 'react-native'
import { ShareIcon } from 'react-native-heroicons/solid'
import ImageView from 'react-native-image-viewing'
import * as FileSystem from 'expo-file-system'
import colors from 'tailwindcss/colors'

type ImageResource = {
  uri: string
}

export type ImageViewingService = {
  add(url: string): void
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
          <View className="flex flex-row justify-between items-center pb-8 px-8">
            <View>
              <Text className="text-neutral-500">
                {imageIndex + 1} / {imageList.current.count()}
              </Text>
            </View>
            <View>
              <Pressable
                className="w-[32px] h-[32px] bg-neutral-800/50 rounded-full flex justify-center items-center active:opacity-50"
                hitSlop={6}
                onPress={async () => {
                  try {
                    const image = imageList.current.get(imageIndex)
                    const downloaded = await downloadImage(image?.uri)
                    if (downloaded) {
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
                    }
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

ImageViewingServiceProvider.displayName = 'ImageViewingServiceProvider'

export default ImageViewingServiceProvider

export const useImageViewing = () => useContext(ServiceContext)

function getImgXtension(uri: string, fallback: string) {
  var basename = uri.split(/[\\/]/).pop()
  if (!basename) {
    return fallback
  }
  return /[.]/.exec(basename) ? /[^.]+$/.exec(basename) : fallback
}

// NO
async function downloadImage(url: string) {
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
