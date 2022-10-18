import React, {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { Pressable, Text, View } from 'react-native'
import DraggableFlatList, {
  ScaleDecorator
} from 'react-native-draggable-flatlist'
import {
  EllipsisHorizontalIcon,
  HomeModernIcon,
  PlusIcon,
  RectangleStackIcon,
  TrashIcon
} from 'react-native-heroicons/outline'
import SwipeableItem, {
  useSwipeableItemParams
} from 'react-native-swipeable-item'
import { useActionSheet } from '@expo/react-native-action-sheet'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput
} from '@gorhom/bottom-sheet'
import { FlashList } from '@shopify/flash-list'
import classNames from 'classnames'
import colors from 'tailwindcss/colors'
import { useColorScheme, useTailwind } from 'tailwindcss-react-native'

import { useActivityIndicator } from '@/containers/ActivityIndicator'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useSWR } from '@/utils/swr'

const UnderlayLeft = (props) => {
  const { close } = useSwipeableItemParams()
  const { colorScheme } = useColorScheme()
  return (
    <View className="h-full flex-row flex-row justify-end bg-red-600 dark:bg-rose-500">
      <Pressable
        className={classNames(
          'w-[56px] h-full flex flex-row items-center justify-center mr-[2px]',
          'active:opacity-70'
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

const LineItem = (props) => {
  const { close, openDirection } = useSwipeableItemParams()
  return (
    <Pressable
      className={classNames(
        'min-h-[50px] flex flex-row items-center pl-4',
        'bg-white dark:bg-neutral-900',
        openDirection !== 'none' &&
          'active:bg-neutral-100 dark:active:bg-neutral-800'
      )}
      onPress={() => {
        if (openDirection !== 'none') {
          close()
        }
      }}
      disabled={props.disabled}
      onLongPress={props.onLongPress}
      style={props.style}>
      <View
        className={classNames('h-full flex-1 flex flex-row', {
          'border-b border-b-neutral-300 dark:border-neutral-600': !props.isLast
        })}>
        <View className="flex-1 flex flex-row items-center">
          {props.icon && <View className="mr-3">{props.icon}</View>}
          <Text className="text-base dark:text-neutral-300">{props.title}</Text>
        </View>
        {props.extra && (
          <View className="h-full flex flex-row items-center pr-3">
            {props.extra}
          </View>
        )}
      </View>
    </Pressable>
  )
}

const pickerSnapPoints = ['50%', '85%']
const renderBackdrop = (props) => {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
    />
  )
}
const AddTabPanelSheet = forwardRef((props, ref) => {
  const nodesSwr = useSWR('/api/nodes/all.json')
  const { colorScheme } = useColorScheme()
  const tintColor =
    colorScheme === 'dark' ? colors.neutral[300] : colors.neutral[900]
  const tw = useTailwind()
  const [filter, setFilter] = useState('')
  const [index, setIndex] = useState(1)
  const filtered = useMemo(() => {
    if (!nodesSwr.data) {
      return null
    }
    if (!filter) {
      return nodesSwr.data
    }
    return nodesSwr.data.filter((n) =>
      ['name', 'title', 'title_alternative'].some(
        (key) => n[key].indexOf(filter) > -1
      )
    )
  }, [nodesSwr.data, filter])

  const renderItem = useCallback(({ item, index }) => {
    return (
      <Pressable
        className="pl-3 active:opacity-50"
        onPress={() => {
          props.onSelect({
            type: 'node',
            value: item.name,
            label: item.title
          })
        }}>
        <View
          className={classNames(
            'h-[50px] flex flex-row items-center border-b pr-3',
            'border-neutral-300',
            'dark:border-neutral-600',
            index === 0 && 'border-t'
          )}>
          <RectangleStackIcon size={18} color={tintColor} />
          <View className="ml-3">
            <Text className="dark:text-neutral-300">{item.title}</Text>
          </View>
        </View>
      </Pressable>
    )
  }, [])

  const header = !filter && !!props.extraItems.length && (
    <>
      <View>
        <View className="px-3 py-1">
          <Text className="text-xs text-neutral-600 dark:text-netural-400">
            已禁用
          </Text>
        </View>
        {props.extraItems.map((item, index) => (
          <Pressable
            className="pl-3 active:opacity-50"
            key={`${item.type}-${item.value}`}
            onPress={() => {
              props.onSelect({
                type: item.type,
                value: item.value,
                label: item.label
              })
            }}>
            <View
              className={classNames(
                'h-[50px] flex flex-row items-center border-b pr-3',
                'border-neutral-300',
                'dark:border-neutral-600',
                index === 0 && 'border-t'
              )}>
              <HomeModernIcon size={18} color={tintColor} />
              <View className="ml-3">
                <Text className="dark:text-neutral-300">{item.label}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
      <View className="mt-3">
        <View className="px-3 py-1">
          <Text className="text-xs text-neutral-600 dark:text-netural-400">
            节点
          </Text>
        </View>
      </View>
    </>
  )

  return (
    <BottomSheetModal
      ref={ref}
      index={index}
      snapPoints={pickerSnapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={tw('bg-white dark:bg-neutral-800')}
      handleIndicatorStyle={tw('bg-neutral-300 dark:bg-neutral-400')}
      onDismiss={() => {
        setIndex(1)
      }}>
      <View className="flex-1 h-full w-full bg-white dark:bg-neutral-800">
        <View className="p-3">
          <BottomSheetTextInput
            onFocus={() => {
              setIndex(0)
            }}
            style={tw(
              'h-[36px] px-2 bg-neutral-100 rounded-md dark:bg-neutral-700 dark:text-neutral-300'
            )}
            selectionColor={
              colorScheme === 'dark' ? colors.amber[50] : colors.neutral[600]
            }
            placeholderTextColor={
              colorScheme === 'dark' ? colors.neutral[500] : colors.neutral[400]
            }
            placeholder={'查找'}
            returnKeyType="search"
            value={filter}
            onChangeText={(text) => {
              setFilter(text)
            }}
          />
        </View>
        <FlashList
          className="w-full flex-1 bg-blue-300"
          data={filtered}
          estimatedItemSize={50}
          renderItem={renderItem}
          keyExtractor={(n) => n.id}
          ListHeaderComponent={header}
        />
      </View>
    </BottomSheetModal>
  )
})

AddTabPanelSheet.displayName = 'AddTabPanelSheet'

export function HomeTabs(props) {
  const { navigation } = props
  const {
    data: { homeTabs },
    update,
    initHomeTabs
  } = useAppSettings()
  const [tabs, setTabs] = useState(homeTabs)
  const { colorScheme } = useColorScheme()
  const sheetRef = useRef()
  const { showActionSheetWithOptions } = useActionSheet()
  const aIndicator = useActivityIndicator()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          className="h-[44px] w-[44px] items-center justify-center -mr-4 active:opacity-60"
          onPress={() => {
            // actionsheet
            showActionSheetWithOptions(
              {
                options: ['取消', '重置'],
                cancelButtonIndex: 0,
                destructiveButtonIndex: 1
              },
              (buttonIndex) => {
                if (buttonIndex === 1) {
                  aIndicator.show()
                  initHomeTabs()
                    .then((newTabs) => {
                      setTabs(newTabs)
                    })
                    .catch((err) => {
                      alert.alertWithType('error', '错误', err.message)
                    })
                    .finally(() => {
                      aIndicator.hide()
                    })
                }
              }
            )
          }}>
          <EllipsisHorizontalIcon
            size={24}
            color={
              colorScheme === 'dark' ? colors.neutral[400] : colors.neutral[800]
            }
          />
        </Pressable>
      )
    })
  }, [])

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (homeTabs !== tabs) {
        update((prev) => ({
          ...prev,
          homeTabs: tabs
        }))
      }
    })
    return unsubscribe
  }, [navigation, tabs, homeTabs])

  const [enabledTabs, disabledTabs] = useMemo(() => {
    const a = []
    const b = []
    tabs.forEach((tab) => {
      if (!tab.disabled) {
        a.push(tab)
      } else {
        b.push(tab)
      }
    })
    return [a, b]
  }, [tabs])

  const renderItem = useCallback(
    ({ item, drag, isActive, index }) => {
      let icon
      const tintColor =
        colorScheme === 'dark' ? colors.neutral[300] : colors.neutral[900]
      if (item.type === 'node') {
        icon = <RectangleStackIcon size={18} color={tintColor} />
      } else {
        icon = <HomeModernIcon size={18} color={tintColor} />
      }
      return (
        <ScaleDecorator>
          <SwipeableItem
            key={item.value}
            item={`${item.type}-${item.value}`}
            swipeEnabled={!isActive}
            snapPointsLeft={[60]}
            renderUnderlayLeft={() => (
              <UnderlayLeft
                onDelete={() => {
                  setTabs((prev) => {
                    const tabIndex = prev.findIndex(
                      (t) => t.type === item.type && t.value === item.value
                    )
                    return [
                      ...prev.slice(0, tabIndex),
                      { ...item, disabled: true },
                      ...prev.slice(tabIndex + 1)
                    ]
                  })
                }}
              />
            )}>
            <LineItem
              onLongPress={drag}
              disabled={isActive}
              title={item.label}
              icon={icon}
              isLast={index === enabledTabs.length - 1}
              style={{
                opacity: isActive ? 0.8 : 1
              }}
            />
          </SwipeableItem>
        </ScaleDecorator>
      )
    },
    [enabledTabs]
  )

  return (
    <>
      <DraggableFlatList
        style={{ height: '100%' }}
        data={enabledTabs}
        onDragEnd={({ data }) => setTabs(data)}
        keyExtractor={(item) => `${item.type}-${item.value}`}
        renderItem={renderItem}
        activationDistance={5}
      />
      <View className="absolute bottom-[56px] right-[24px]">
        <Pressable
          className={classNames(
            'w-[62px] h-[62px] items-center justify-center rounded-full shadow-sm active:opacity-60',
            'bg-neutral-900',
            'dark:bg-amber-50'
          )}
          onPress={() => {
            sheetRef.current?.present()
          }}>
          <PlusIcon
            color={colorScheme === 'dark' ? colors.neutral[900] : 'white'}
            size={22}
          />
        </Pressable>
      </View>
      <AddTabPanelSheet
        extraItems={disabledTabs}
        ref={sheetRef}
        onSelect={(item) => {
          setTabs((prev) => {
            const relatedItemIndex = prev.findIndex(
              (t) => t.type === item.type && t.value === item.value
            )
            if (relatedItemIndex > -1) {
              return [
                item,
                ...prev.slice(0, relatedItemIndex),
                ...prev.slice(relatedItemIndex + 1)
              ]
            }
            return [item, ...prev]
          })
          sheetRef.current?.close()
        }}
      />
    </>
  )
}
