import { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import ImageView from 'react-native-image-viewing'
import classNames from 'classnames'
import { SWRResponse } from 'swr'

import CheckIcon from '@/components/CheckIcon'
import { ImgurImage } from '@/containers/ImgurService/types'
import { useTheme } from '@/containers/ThemeService'
import { isRefreshing } from '@/utils/swr'

import MyRefreshControl from '../MyRefreshControl'
import ImageCard from './ImageCard'

export type ImagesGridProps = {
  imagesSwr: SWRResponse<ImgurImage[], Error>
  selected: ImgurImage[]
  onToggleSelect(image: ImgurImage): void
}
export default function ImagesGrid(props: ImagesGridProps) {
  const { imagesSwr } = props
  const { styles } = useTheme()

  const [viewIndex, setViewIndex] = useState(-1)

  const imageViewingProps = useMemo(() => {
    const imageItems = imagesSwr.data
    return {
      images: imageItems?.map((item) => ({
        uri: item.link,
      })),
      FooterComponent: ({ imageIndex }) => {
        const image = imageItems[imageIndex]
        const selected = !!props.selected.find((i) => i.id === image.id)
        return (
          <View className="flex flex-row w-full px-3 pb-8 items-center justify-between">
            <View className="w-[80px]">
              <View className="px-2">
                <Text className="text-neutral-300">
                  {imageIndex + 1} / {imageItems.length}
                </Text>
              </View>
            </View>
            <View className="flex-1">
              <Pressable
                className="h-[52px] rounded-lg flex flex-row items-center justify-center px-4 active:opacity-60"
                onPress={() => {
                  props.onToggleSelect(image)
                }}>
                <View
                  className={classNames(
                    'w-[18px] h-[18px] rounded-full items-center justify-center',
                    '-mr-1 mr-2',
                    selected
                      ? 'bg-emerald-400'
                      : 'border-[1.5px] border-neutral-300',
                  )}>
                  {selected && <CheckIcon size={12} color="#111" />}
                </View>
                <Text
                  className={classNames(
                    selected ? 'text-emerald-400' : 'text-neutral-300',
                  )}
                  style={styles.text_base}>
                  选择
                </Text>
              </Pressable>
            </View>
            <View className="w-[80px]">
              <Pressable
                className="h-[52px] rounded-lg flex flex-row items-center justify-center px-4 active:opacity-60"
                onPress={() => {
                  setViewIndex(-1)
                }}>
                <Text className="text-neutral-300" style={styles.text_base}>
                  {props.selected.length ? '完成' : '关闭'}
                </Text>
              </Pressable>
            </View>
          </View>
        )
      },
    }
  }, [imagesSwr.data, props.selected])

  const imageItems = imagesSwr.data

  return (
    <ScrollView
      refreshControl={
        <MyRefreshControl
          refreshing={isRefreshing(imagesSwr)}
          onRefresh={() => {
            imagesSwr.mutate()
          }}
        />
      }>
      <View className="py-2 px-[1px]">
        <View className="flex flex-row flex-wrap">
          {imageItems?.map((image, index) => (
            <View className="basis-1/3 p-[1px]" key={image.id}>
              <ImageCard
                data={image}
                selected={!!props.selected.find((i) => i.id === image.id)}
                onToggleSelect={() => {
                  props.onToggleSelect(image)
                }}
                onPress={() => {
                  setViewIndex(index)
                }}
              />
            </View>
          ))}
        </View>
      </View>
      <ImageView
        {...imageViewingProps}
        imageIndex={viewIndex}
        visible={viewIndex > -1}
        onRequestClose={() => setViewIndex(-1)}
      />
    </ScrollView>
  )
}
