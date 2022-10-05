import { View, Text, ScrollView, RefreshControl, Pressable } from 'react-native'
import { useState, useMemo } from 'react'
import ImageView from 'react-native-image-viewing'

import { useColorScheme } from 'tailwindcss-react-native'
import colors from 'tailwindcss/colors'
import classNames from 'classnames'

import CheckIcon from '@/components/CheckIcon'
import { isRefreshing } from '@/utils/swr'

import ImageCard from './ImageCard'

export default function ImagesView(props) {
  const { imagesSwr } = props
  const { colorScheme } = useColorScheme()

  const [viewIndex, setViewIndex] = useState(-1)

  const imageViewingProps = useMemo(() => {
    return {
      images: imagesSwr.data?.map((item) => ({
        uri: item.link
      })),
      FooterComponent: ({ imageIndex }) => {
        const image = imagesSwr.data[imageIndex]
        const selected = !!props.selected.find((i) => i.id === image.id)
        return (
          <View className="flex flex-row w-full px-3 pb-8 items-center justify-between">
            <View className="w-[80px]">
              <View className="px-2">
                <Text className="text-neutral-300">
                  {imageIndex + 1} / {imagesSwr.data.length}
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
                      ? 'bg-neutral-300'
                      : 'border-[1.5px] border-neutral-300'
                  )}>
                  {selected && <CheckIcon size={12} color="#111" />}
                </View>
                <Text className="text-neutral-300 text-base">选择</Text>
              </Pressable>
            </View>
            <View className="w-[80px]">
              <Pressable
                className="h-[52px] rounded-lg flex flex-row items-center justify-center px-4 active:opacity-60"
                onPress={() => {
                  setViewIndex(-1)
                }}>
                <Text className="text-neutral-300 text-base">
                  {props.selected.length ? '完成' : '关闭'}
                </Text>
              </Pressable>
            </View>
          </View>
        )
      }
    }
  }, [imagesSwr.data, props.selected])

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          tintColor={
            colorScheme === 'dark' ? colors.neutral[300] : colors.neutral[900]
          }
          refreshing={isRefreshing(imagesSwr)}
          onRefresh={() => {
            imagesSwr.mutate()
          }}
        />
      }>
      <View className="py-2 px-[1px]">
        <View className="flex flex-row flex-wrap">
          {imagesSwr.data?.map((image, index) => (
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