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
import colors from 'tailwindcss/colors'
import { useColorScheme, useTailwind } from 'tailwindcss-react-native'

import FixedPressable from '@/components/FixedPressable'
import TimeAgo from '@/components/TimeAgo'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useViewedTopics } from '@/containers/ViewedTopicsService'

const UnderlayLeft = (props) => {
  const { close } = useSwipeableItemParams()
  const { colorScheme } = useColorScheme()
  return (
    <View className="h-full flex-row flex-row justify-end bg-red-600 dark:bg-rose-500">
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
        <TrashIcon
          color={colorScheme === 'dark' ? colors.neutral[100] : colors.white}
        />
      </Pressable>
    </View>
  )
}

const TopicRow = (props) => {
  const { navigation, data, showAvatar } = props
  const { node, member, title } = data
  return (
    <FixedPressable
      className="border-b border-neutral-200 bg-white flex flex-row items-center active:opacity-50 dark:bg-neutral-900 dark:border-neutral-600"
      onPress={() => {
        navigation.push('topic', {
          id: data.id,
          brief: data,
        })
      }}>
      {showAvatar ? (
        <View className="px-2 py-2 self-start">
          <FixedPressable
            onPress={() => {
              navigation.navigate('member', {
                username: member.username,
                brief: member,
              })
            }}>
            <FastImage
              source={{
                uri: member.avatar_large,
              }}
              className="w-[24px] h-[24px] rounded"
            />
          </FixedPressable>
        </View>
      ) : (
        <View className="pl-3"></View>
      )}

      <View className={classNames('flex-1 py-2')}>
        <View className="flex flex-row items-center pt-[2px] space-x-1 mb-1">
          <View>
            <FixedPressable
              hitSlop={4}
              className="py-[2px] px-[6px] rounded bg-neutral-100 active:opacity-60 dark:bg-neutral-750"
              onPress={() => {
                navigation.navigate('node', {
                  name: node.name,
                  brief: node,
                })
              }}>
              <Text className="text-neutral-500 text-xs dark:text-neutral-300">
                {node.title}
              </Text>
            </FixedPressable>
          </View>
          <Text className="text-neutral-400">·</Text>
          <View className="relative top-[1px]">
            <FixedPressable
              className="active:opacity-60"
              hitSlop={5}
              onPress={() => {
                navigation.navigate('member', {
                  username: member.username,
                  brief: member,
                })
              }}>
              <Text className="font-bold text-xs text-neutral-700 dark:text-neutral-400">
                {member.username}
              </Text>
            </FixedPressable>
          </View>
        </View>
        <View>
          <Text className="text-base text-neutral-700 dark:text-neutral-300">
            {title}
          </Text>
          <View className="mt-2 flex flex-row items-center">
            <Text className="text-xs text-neutral-400 mr-2">上次查看</Text>
            <Text className="text-xs text-neutral-400">
              <TimeAgo date={data.viewed_at} />
            </Text>
          </View>
        </View>
      </View>
    </FixedPressable>
  )
}

const TideTopicRow = (props) => {
  const { navigation, data, showAvatar } = props
  const { node, member, title } = data
  return (
    <FixedPressable
      sentry-label="TideTopicRow"
      className={classNames(
        'border-b flex flex-row items-center active:opacity-50',
        'border-neutral-200 bg-white',
        'dark:border-neutral-700 dark:bg-neutral-900',
      )}
      onPress={() => {
        navigation.push('topic', {
          id: props.data.id,
          brief: props.data,
        })
      }}>
      {showAvatar ? (
        <View className="px-2 py-2 self-start">
          <FixedPressable
            onPress={() => {
              navigation.navigate('member', {
                username: member.username,
                brief: member,
              })
            }}>
            <FastImage
              source={{
                uri: member.avatar_large,
              }}
              className="w-[24px] h-[24px] rounded"
            />
          </FixedPressable>
        </View>
      ) : (
        <View className="pl-3"></View>
      )}
      <View
        className={classNames(
          'flex-1 pt-1 pb-2',
          props.viewed && 'opacity-70',
        )}>
        <Text className="text-[16px] leading-[22px] text-neutral-700 dark:text-neutral-300">
          {title}
        </Text>
        <View className="mt-1 flex flex-row flex-wrap items-center">
          <FixedPressable
            hitSlop={4}
            className="py-[2px] px-[6px] mr-[6px] rounded bg-neutral-100 active:opacity-60 dark:bg-neutral-750"
            onPress={() => {
              navigation.navigate('node', {
                name: node.name,
                brief: node,
              })
            }}>
            <Text className="text-xs text-neutral-500 dark:text-neutral-300">
              {node.title}
            </Text>
          </FixedPressable>
          <Text className="text-xs text-neutral-400 mr-2">上次查看</Text>
          <Text className="text-xs text-neutral-400">
            <TimeAgo date={data.viewed_at} />
          </Text>
        </View>
      </View>
    </FixedPressable>
  )
}

export default function ViewedTopicsScreen({ navigation }) {
  const { getItems, clear, removeItem } = useViewedTopics()
  const { showActionSheetWithOptions } = useActionSheet()
  const { data: settings } = useAppSettings()
  const { renderItem, keyExtractor, data } = useMemo(
    () => ({
      data: getItems(),
      renderItem: ({ item, index }) => {
        const inner =
          settings.feedLayout === 'tide' ? (
            <TideTopicRow
              data={item}
              navigation={navigation}
              showAvatar={settings.feedShowAvatar}
            />
          ) : (
            <TopicRow
              data={item}
              navigation={navigation}
              showAvatar={settings.feedShowAvatar}
            />
          )

        return (
          <SwipeableItem
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
            <View className="bg-white dark:bg-neutral-900">{inner}</View>
          </SwipeableItem>
        )
      },
      keyExtractor: (item) => item.id,
    }),
    [
      settings.feedLayout,
      settings.showAvatar,
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
          <Text className="text-neutral-600 dark:text-neutral-400">
            你还没有查看过任何一个主题哦～
          </Text>
        </View>
      )}
      ListFooterComponent={() => (
        <View
          sentry-label="ListFooter"
          className="min-h-[60px] py-4 flex flex-row items-center justify-center">
          <View className="w-full flex flex-row justify-center py-4">
            <Text className="text-neutral-400">到达底部啦</Text>
          </View>
        </View>
      )}
    />
  )
}
