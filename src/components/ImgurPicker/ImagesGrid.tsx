import { useCallback, useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import ContextMenu from 'react-native-context-menu-view'
import { UseQueryResult } from '@tanstack/react-query'

import CheckIcon from '@/components/CheckIcon'
import { ImageViewing } from '@/components/ImageViewing'

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
          <View style={gridStyles.footerContainer}>
            <View style={gridStyles.footerLeft}>
              <View style={gridStyles.footerIndexWrap}>
                <Text style={gridStyles.textNeutral300}>
                  {imageIndex + 1} / {imageItems.length}
                </Text>
              </View>
            </View>
            <View style={gridStyles.flex1}>
              <Pressable
                style={({ pressed }) => [
                  gridStyles.selectBtn,
                  pressed && gridStyles.pressed,
                ]}
                onPress={() => {
                  props.onToggleSelect(image)
                }}
              >
                <View
                  style={[
                    gridStyles.checkCircle,
                    selected
                      ? gridStyles.checkCircleSelected
                      : gridStyles.checkCircleUnselected,
                  ]}
                >
                  {selected && <CheckIcon size={12} color='#111' />}
                </View>
                <Text
                  style={[
                    styles.text_base,
                    selected
                      ? gridStyles.textEmerald400
                      : gridStyles.textNeutral300,
                  ]}
                >
                  选择
                </Text>
              </Pressable>
            </View>
            <View style={gridStyles.footerRight}>
              <Pressable
                style={({ pressed }) => [
                  gridStyles.closeBtn,
                  pressed && gridStyles.pressed,
                ]}
                onPress={() => {
                  setViewIndex(-1)
                  props.selected.length && context.submit()
                }}
              >
                <Text
                  style={[gridStyles.textNeutral300, styles.text_base]}
                >
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
      <View style={gridStyles.loaderWrap}>
        <Loader />
      </View>
    )
  } else if (!hasData) {
    content = (
      <View style={gridStyles.emptyWrap}>
        <Text style={styles.text}>相册里没有图片哦~</Text>
      </View>
    )
  } else {
    content = imageItems?.map((image, index) => (
      <View style={gridStyles.gridItem} key={image.id}>
        <ContextMenu
          actions={[{ title: '删除', systemIcon: 'trash' }]}
          onPress={({ nativeEvent }) => {
            switch (nativeEvent.index) {
              case 0:
                return props.onDelete(image)
            }
          }}
        >
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
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={gridStyles.container}>
        <View style={gridStyles.gridRow}>{content}</View>
      </View>
      <ImageViewing
        {...imageViewingProps}
        imageIndex={viewIndex}
        visible={viewIndex > -1}
        onRequestClose={() => setViewIndex(-1)}
      />
    </ScrollView>
  )
}

const gridStyles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 12,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: {
    width: 80,
  },
  footerIndexWrap: {
    paddingHorizontal: 8,
  },
  textNeutral300: {
    color: '#d4d4d4',
  },
  textEmerald400: {
    color: '#34d399',
  },
  flex1: {
    flex: 1,
  },
  selectBtn: {
    height: 52,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginLeft: -4,
  },
  checkCircleSelected: {
    backgroundColor: '#34d399',
  },
  checkCircleUnselected: {
    borderWidth: 1.5,
    borderColor: '#d4d4d4',
  },
  footerRight: {
    width: 80,
  },
  closeBtn: {
    height: 52,
    minWidth: 60,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  pressed: {
    opacity: 0.6,
  },
  loaderWrap: {
    paddingVertical: 24,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    padding: 24,
  },
  gridItem: {
    flexBasis: '33.333333%',
    padding: 1,
  },
  container: {
    paddingVertical: 8,
    paddingHorizontal: 1,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
})
