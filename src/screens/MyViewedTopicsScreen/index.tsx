import { useCallback, useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import {
  EllipsisHorizontalIcon,
  TrashIcon,
} from 'react-native-heroicons/outline'
import SwipeableItem, {
  useSwipeableItemParams,
} from 'react-native-swipeable-item'
import { useActionSheet } from '@expo/react-native-action-sheet'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { FlashList } from '@shopify/flash-list'
import classNames from 'classnames'

import Button from '@/components/Button'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { useViewedTopics } from '@/containers/ViewedTopicsService'

import Header from './Header'
import TideViewedTopicRow from './TideViewedTopicRow'
import ViewedTopicRow from './ViewedTopicRow'

const Actions = (props) => {
  const params = useSwipeableItemParams()
  const { styles } = useTheme()
  return (
    <View className="h-full flex-row justify-end" style={styles.btn_danger__bg}>
      <Pressable
        className={classNames(
          'w-[56px] h-full flex flex-row items-center justify-center mr-[2px]',
          'active:opacity-70',
        )}
        onPress={() => {
          params.close().then(() => {
            props.onDelete(params.item)
          })
        }}>
        <TrashIcon color={styles.btn_danger__text.color} />
      </Pressable>
    </View>
  )
}

type ScreenProps = NativeStackScreenProps<AppStackParamList, 'viewed-topics'>
export default function ViewedTopicsScreen(props: ScreenProps) {
  const { getItems, clear, removeItem } = useViewedTopics()
  const { showActionSheetWithOptions } = useActionSheet()
  const { data: settings } = useAppSettings()
  const { styles, theme, colorScheme } = useTheme()
  const [filter, setFilter] = useState('')

  const data = useMemo(() => {
    const all = getItems()
    if (!filter) {
      return all
    }
    const regex = new RegExp(filter, 'i')
    return all.filter(
      (item) => regex.test(item.title) || regex.test(item.content_rendered),
    )
  }, [filter, getItems])

  const { renderItem, keyExtractor } = useMemo(
    () => ({
      renderItem: ({ item, index }) => {
        const inner =
          settings.feedLayout === 'tide' ? (
            <TideViewedTopicRow
              data={item}
              isLast={index === data.length - 1}
              showAvatar={settings.feedShowAvatar}
              titleStyle={settings.feedTitleStyle}
            />
          ) : (
            <ViewedTopicRow
              data={item}
              isLast={index === data.length - 1}
              showAvatar={settings.feedShowAvatar}
              titleStyle={settings.feedTitleStyle}
            />
          )

        return (
          <MaxWidthWrapper style={styles.layer1}>
            <SwipeableItem
              item={item}
              key={item.id}
              swipeEnabled
              snapPointsLeft={[60]}
              overSwipe={60}
              renderUnderlayLeft={() => <Actions onDelete={removeItem} />}>
              <View style={styles.layer1}>{inner}</View>
            </SwipeableItem>
          </MaxWidthWrapper>
        )
      },
      keyExtractor: (item) => item.id,
    }),
    [settings.feedLayout, settings.feedShowAvatar, data, removeItem],
  )

  const headerRight = useMemo(
    () => (
      <Button
        className="h-[44px] w-[44px] rounded-full"
        variant="icon"
        radius={22}
        onPress={() => {
          // actionsheet
          showActionSheetWithOptions(
            {
              options: ['取消', '清除缓存'],
              cancelButtonIndex: 0,
              destructiveButtonIndex: 1,
              tintColor: theme.colors.primary,
              userInterfaceStyle: colorScheme,
              containerStyle: styles.layer1,
            },
            (buttonIndex) => {
              if (buttonIndex === 1) {
                clear()
              }
            },
          )
        }}>
        <EllipsisHorizontalIcon size={24} color={theme.colors.text} />
      </Button>
    ),
    [theme.colors],
  )

  const submitFilter = useCallback(
    (text) => {
      setFilter(text.trim())
    },
    [setFilter],
  )

  const resetFilter = useCallback(() => {
    setFilter('')
  }, [setFilter])

  return (
    <View className="flex-1">
      <Header
        title={'浏览的主题（缓存）'}
        initialFilter={filter}
        onChangeFilter={setFilter}
        onResetFilter={resetFilter}
        onSubmitFilter={submitFilter}
        headerRight={headerRight}
      />
      <FlashList
        contentInsetAdjustmentBehavior="automatic"
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
    </View>
  )
}
