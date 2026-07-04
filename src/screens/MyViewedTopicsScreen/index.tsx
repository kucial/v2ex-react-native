import { useCallback, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import {
  EllipsisHorizontalIcon,
  TrashIcon,
} from 'react-native-heroicons/outline'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import SwipeableItem, {
  useSwipeableItemParams,
} from 'react-native-swipeable-item'
import { useActionSheet } from '@expo/react-native-action-sheet'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { FlashList } from '@shopify/flash-list'

import Button from '@/components/Button'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'

import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import {
  useClearViewedTopics,
  useRemoveViewedTopic,
  useViewedItems,
} from '@/containers/ViewedTopicsService'

import Header from './Header'
import TideViewedTopicRow from './TideViewedTopicRow'
import ViewedTopicRow from './ViewedTopicRow'

const Actions = (props) => {
  const params = useSwipeableItemParams()
  const { styles } = useTheme()
  return (
    <View style={[viewedStyles.actionsWrap, styles.btn_danger__bg]}>
      <Pressable
        style={({ pressed }) => [
          viewedStyles.deleteBtn,
          pressed && viewedStyles.pressed,
        ]}
        onPress={() => {
          params.close().then(() => {
            props.onDelete(params.item)
          })
        }}
      >
        <TrashIcon color={styles.btn_danger__text.color} />
      </Pressable>
    </View>
  )
}

type ScreenProps = NativeStackScreenProps<AppStackParamList, 'viewed-topics'>
export default function ViewedTopicsScreen(props: ScreenProps) {
  const items = useViewedItems()
  const clear = useClearViewedTopics()
  const removeItem = useRemoveViewedTopic()
  const { showActionSheetWithOptions } = useActionSheet()
  const { data: settings } = useAppSettings()
  const { styles, theme, colorScheme } = useTheme()
  const [filter, setFilter] = useState('')
  const insets = useSafeAreaInsets()

  const data = useMemo(() => {
    if (!filter) {
      return items
    }
    const regex = new RegExp(filter, 'i')
    return items.filter((item) => regex.test(item.title))
  }, [filter, items])

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
              renderUnderlayLeft={() => <Actions onDelete={removeItem} />}
            >
              <View style={styles.layer1}>{inner}</View>
            </SwipeableItem>
          </MaxWidthWrapper>
        )
      },
      keyExtractor: (item) => item.id,
    }),
    [settings.feedLayout, settings.feedShowAvatar, settings.feedTitleStyle, data, removeItem, styles.layer1],
  )

  const headerRight = useMemo(
    () => (
      <Button
        style={viewedStyles.iconBtn}
        variant='icon'
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
              containerStyle: {
                ...styles.layer1,
                paddingBottom: insets.bottom,
              },
            },
            (buttonIndex) => {
              if (buttonIndex === 1) {
                clear()
              }
            },
          )
        }}
      >
        <EllipsisHorizontalIcon size={24} color={theme.colors.text} />
      </Button>
    ),
    [theme.colors, showActionSheetWithOptions, colorScheme, styles.layer1, insets.bottom, clear],
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
    <View style={viewedStyles.container}>
      <Header
        title={'浏览的主题（缓存）'}
        initialFilter={filter}
        onChangeFilter={setFilter}
        onResetFilter={resetFilter}
        onSubmitFilter={submitFilter}
        headerRight={headerRight}
      />
      <FlashList
        contentInsetAdjustmentBehavior='automatic'
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListEmptyComponent={() => (
          <View style={viewedStyles.emptyWrap}>
            <Text style={styles.text_meta}>你还没有查看过任何一个主题哦～</Text>
          </View>
        )}
        ListFooterComponent={() =>
          !!data.length && (
            <View
              sentry-label='ListFooter'
              style={viewedStyles.footerWrap}
            >
              <View style={viewedStyles.footerInner}>
                <Text style={styles.text_meta}>到达底部啦</Text>
              </View>
            </View>
          )
        }
      />
    </View>
  )
}

const viewedStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actionsWrap: {
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteBtn: {
    width: 56,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  iconBtn: {
    height: 44,
    width: 44,
    borderRadius: 22,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  footerWrap: {
    minHeight: 60,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerInner: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
})
