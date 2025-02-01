import { useCallback, useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import ContextMenu from 'react-native-context-menu-view'
import ImageView from 'react-native-image-viewing'
import { UseQueryResult } from '@tanstack/react-query'
import classNames from 'classnames'

import CheckIcon from '@/components/CheckIcon'
import { ImgurImage } from '@/containers/ImgurService/types'
import { useTheme } from '@/containers/ThemeService'

import Loader from '../Loader'
import MyRefreshControl from '../MyRefreshControl'
import { usePickerContext } from './context'
import ImageCard from './ImageCard'

export type ImagesGridProps = {
  imagesQuery: UseQueryResult<ImgurImage[], Error>
  selected: ImgurImage[]
  onToggleSelect(image: ImgurImage): void
  onDelete(image: ImgurImage): void
}
export default function ImagesGrid(props: ImagesGridProps) {
  const { imagesQuery } = props
  const { styles } = useTheme()

  const [viewIndex, setViewIndex] = useState(-1)
  const context = usePickerContext()

  const imageViewingProps = useMemo(() => {
    const imageItems = imagesQuery.data
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
                className="h-[52px] min-w-[60px] rounded-lg flex flex-row items-center justify-center px-2 active:opacity-60"
                onPress={() => {
                  setViewIndex(-1)
                  props.selected.length && context.submit()
                }}>
                <Text className="text-neutral-300" style={styles.text_base}>
                  {props.selected.length ? '完成选择' : '关闭'}
                </Text>
              </Pressable>
            </View>
          </View>
        )
      },
    }
  }, [imagesQuery.data, props.selected])

  const imageItems = imagesQuery.data

  const hasData = !imagesQuery.isLoading && imageItems?.length

  let content
  if (imagesQuery.isLoading) {
    content = (
      <View className="py-6 w-full items-center justify-center">
        <Loader />
      </View>
    )
  } else if (!hasData) {
    content = (
      <View className="p-6">
        <Text style={styles.text}>相册里没有图片哦~</Text>
      </View>
    )
  } else {
    content = imageItems?.map((image, index) => (
      <View className="basis-1/3 p-[1px]" key={image.id}>
        <ContextMenu
          actions={[{ title: '删除', systemIcon: 'trash' }]}
          onPress={({ nativeEvent }) => {
            switch (nativeEvent.index) {
              case 0:
                return props.onDelete(image)
            }
          }}>
          <View>
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
        </ContextMenu>
      </View>
    ))
  }

  return (
    <ScrollView
      refreshControl={
        <MyRefreshControl
          refreshing={imagesQuery.isRefetching}
          onRefresh={imagesQuery.refetch}
        />
      }
      contentContainerStyle={{ paddingBottom: 100 }}>
      <View className="py-2 px-[1px]">
        <View className="flex flex-row flex-wrap">{content}</View>
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
