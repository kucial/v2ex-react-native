import { useLayoutEffect, useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import {
  EllipsisHorizontalIcon,
  TrashIcon,
} from 'react-native-heroicons/outline'
import SwipeableItem, {
  useSwipeableItemParams,
} from 'react-native-swipeable-item'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { FlashList } from '@shopify/flash-list'
import classNames from 'classnames'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { ViewedTopic } from '@/types/v2ex'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { useViewedTopics } from '@/containers/ViewedTopicsService'

import ViewedTopicRow from './ViewedTopicRow'
import TideViewedTopicRow from './TideViewedTopicRow'

const UnderlayLeft = (props) => {
  const { close } = useSwipeableItemParams()
  const { styles } = useTheme()
  return (
    <View
      className="h-full flex-row flex-row justify-end"
      style={styles.btn_danger__bg}>
      <Pressable
        className={classNames(
          'w-[56px] h-full flex flex-row items-center justify-center mr-[2px]',
          'active:opacity-70',
        )}
        onPress={() => {
          close().then(() => {
            props.onDelete()
          })
        }}>
        <TrashIcon color={styles.btn_danger__text.color} />
      </Pressable>
    </View>
  )
}

type ScreenProps = NativeStackScreenProps<AppStackParamList, 'viewed-topics'>
export default function ViewedTopicsScreen({ navigation }: ScreenProps) {
  const { getItems, clear, removeItem } = useViewedTopics()
  const { showActionSheetWithOptions } = useActionSheet()
  const { data: settings } = useAppSettings()
  const { styles } = useTheme()
  const { renderItem, keyExtractor, data } = useMemo(
    () => ({
      data: getItems(),
      renderItem: ({ item }: { item: ViewedTopic }) => {
        const inner =
          settings.feedLayout === 'tide' ? (
            <TideViewedTopicRow
              data={item}
              showAvatar={settings.feedShowAvatar}
            />
          ) : (
            <ViewedTopicRow data={item} showAvatar={settings.feedShowAvatar} />
          )

        return (
          <SwipeableItem
            item={item}
            key={item.id}
            swipeEnabled
            snapPointsLeft={[60]}
            renderUnderlayLeft={() => (
              <UnderlayLeft
                onDelete={() => {
                  removeItem(item)
                }}
              />
            )}>
            <View style={styles.layer1}>{inner}</View>
          </SwipeableItem>
        )
      },
      keyExtractor: (item) => item.id,
    }),
    [
      settings.feedLayout,
      settings.feedShowAvatar,
      navigation,
      getItems,
      removeItem,
    ],
  )

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (props) => (
        <Pressable
          className="h-[44px] w-[44px] items-center justify-center -mr-4 active:opacity-60"
          onPress={() => {
            // actionsheet
            showActionSheetWithOptions(
              {
                options: ['取消', '清除缓存'],
                cancelButtonIndex: 0,
                destructiveButtonIndex: 1,
              },
              (buttonIndex) => {
                if (buttonIndex === 1) {
                  clear()
                }
              },
            )
          }}>
          <EllipsisHorizontalIcon size={24} color={props.tintColor} />
        </Pressable>
      ),
    })
  }, [])

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={110}
      ListEmptyComponent={() => (
        <View className="items-center py-9">
          <Text style={styles.text_meta}>你还没有查看过任何一个主题哦～</Text>
        </View>
      )}
      ListFooterComponent={() =>
        !!data.length && (
          <View
            sentry-label="ListFooter"
            className="min-h-[60px] py-4 flex flex-row items-center justify-center">
            <View className="w-full flex flex-row justify-center py-4">
              <Text style={styles.text_meta}>到达底部啦</Text>
            </View>
          </View>
        )
      }
    />
  )
}
