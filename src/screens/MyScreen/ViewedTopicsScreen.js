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

import FixedPressable from '@/components/FixedPressable'
import TimeAgo from '@/components/TimeAgo'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { useViewedTopics } from '@/containers/ViewedTopicsService'

const UnderlayLeft = (props) => {
  const { close } = useSwipeableItemParams()
  const { styles } = useTheme()
  return (
    <View
      className="h-full flex-row flex-row justify-end"
      style={styles.btn_danger.bg}>
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
        <TrashIcon color={styles.btn_danger.text.color} />
      </Pressable>
    </View>
  )
}

const TopicRow = (props) => {
  const { navigation, data, showAvatar } = props
  const { node, member, title } = data
  const { styles } = useTheme()
  return (
    <FixedPressable
      className="flex flex-row items-center active:opacity-50"
      style={[styles.layer1, styles.border_b, styles.border_light]}
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
              className="py-[2px] px-[6px] rounded active:opacity-60"
              style={styles.layer2}
              onPress={() => {
                navigation.navigate('node', {
                  name: node.name,
                  brief: node,
                })
              }}>
              <Text className="text-xs" style={styles.text_desc}>
                {node.title}
              </Text>
            </FixedPressable>
          </View>
          <Text style={styles.text_meta}>·</Text>
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
              <Text className="font-bold text-xs" style={styles.text_desc}>
                {member.username}
              </Text>
            </FixedPressable>
          </View>
        </View>
        <View>
          <Text className="text-base" style={styles.text}>
            {title}
          </Text>
          <View className="mt-2 flex flex-row items-center">
            <Text className="text-xs mr-2" style={styles.text_meta}>
              上次查看
            </Text>
            <Text className="text-xs" style={styles.text_meta}>
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
  const { styles } = useTheme()
  return (
    <FixedPressable
      sentry-label="TideTopicRow"
      className={classNames('flex flex-row items-center', 'active:opacity-50')}
      style={[styles.layer1, styles.border_b, styles.border_light]}
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
        <Text className="text-base leading-[22px]" style={styles.text}>
          {title}
        </Text>
        <View className="mt-1 flex flex-row flex-wrap items-center">
          <FixedPressable
            hitSlop={4}
            className="py-[2px] px-[6px] mr-[6px] rounded active:opacity-60"
            style={styles.layer2}
            onPress={() => {
              navigation.navigate('node', {
                name: node.name,
                brief: node,
              })
            }}>
            <Text className="text-xs" style={styles.text_desc}>
              {node.title}
            </Text>
          </FixedPressable>
          <Text className="text-xs mr-2" style={styles.text_meta}>
            上次查看
          </Text>
          <Text className="text-xs" style={styles.text_meta}>
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
  const { styles } = useTheme()
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
            <View style={styles.layer1}>{inner}</View>
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
