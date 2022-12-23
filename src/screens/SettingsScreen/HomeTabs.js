import {
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import DraggableFlatList, {
  ScaleDecorator,
} from 'react-native-draggable-flatlist'
import {
  EllipsisHorizontalIcon,
  HomeModernIcon,
  PlusIcon,
  RectangleStackIcon,
  TrashIcon,
} from 'react-native-heroicons/outline'
import SwipeableItem, {
  useSwipeableItemParams,
} from 'react-native-swipeable-item'
import { useActionSheet } from '@expo/react-native-action-sheet'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet'
import { FlashList } from '@shopify/flash-list'
import classNames from 'classnames'
import colors from 'tailwindcss/colors'

import { useActivityIndicator } from '@/containers/ActivityIndicator'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { useSWR } from '@/utils/swr'

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

const LineItem = (props) => {
  const { close, openDirection } = useSwipeableItemParams()
  const { styles } = useTheme()
  return (
    <Pressable
      className={classNames(
        'min-h-[50px] flex flex-row items-center pl-4',
        openDirection !== 'none' &&
          'active:bg-neutral-100 dark:active:bg-neutral-800',
      )}
      style={[styles.layer1, props.style]}
      onPress={() => {
        if (openDirection !== 'none') {
          close()
        }
      }}
      disabled={props.disabled}
      onLongPress={props.onLongPress}>
      <View
        className={classNames('h-full flex-1 flex flex-row')}
        style={!props.isLast && [styles.border_b, styles.border_bottom]}>
        <View className="flex-1 flex flex-row items-center">
          {props.icon && <View className="mr-3">{props.icon}</View>}
          <Text className="text-base" style={styles.text}>
            {props.title}
          </Text>
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
  const { theme, styles } = useTheme()

  const tintColor = theme.colors.text

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
        (key) => n[key].indexOf(filter) > -1,
      ),
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
            label: item.title,
          })
        }}>
        <View
          className={classNames('h-[50px] flex flex-row items-center pr-3')}
          style={[
            styles.border_b,
            styles.border_light,
            index === 0 && styles.border_t,
          ]}>
          <RectangleStackIcon size={18} color={tintColor} />
          <View className="ml-3">
            <Text style={styles.text}>{item.title}</Text>
          </View>
        </View>
      </Pressable>
    )
  }, [])

  const header = !filter && !!props.extraItems.length && (
    <>
      <View>
        <View className="px-3 py-1">
          <Text className="text-xs" style={styles.text_meta}>
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
                label: item.label,
              })
            }}>
            <View
              className={classNames(
                'h-[50px] flex flex-row items-center  pr-3',
              )}
              style={[
                styles.border_b,
                styles.border_light,
                index === 0 && styles.border_t,
              ]}>
              <HomeModernIcon size={18} color={tintColor} />
              <View className="ml-3">
                <Text style={styles.text}>{item.label}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
      <View className="mt-3">
        <View className="px-3 py-1">
          <Text className="text-xs" style={styles.text_meta}>
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
      backgroundStyle={styles.overlay}
      handleIndicatorStyle={{
        backgroundColor: theme.colors.bg_bottom_sheet_handle,
      }}
      onDismiss={() => {
        setIndex(1)
      }}>
      <View className="flex-1 h-full w-full">
        <View className="p-3">
          <BottomSheetTextInput
            onFocus={() => {
              setIndex(0)
            }}
            style={{
              height: 36,
              paddingHorizontal: 8,
              borderRadius: 6,
              backgroundColor: theme.colors.bg_input,
              color: theme.colors.text,
            }}
            selectionColor={theme.colors.primary}
            placeholderTextColor={theme.colors.text_placeholder}
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
  const { theme, styles } = useTheme()
  const {
    data: { homeTabs },
    update,
    initHomeTabs,
  } = useAppSettings()
  const [tabs, setTabs] = useState(homeTabs || [])
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
                destructiveButtonIndex: 1,
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
              },
            )
          }}>
          <EllipsisHorizontalIcon size={24} color={theme.colors.text} />
        </Pressable>
      ),
    })
  }, [])

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
      const tintColor = theme.colors.text
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
                      (t) => t.type === item.type && t.value === item.value,
                    )
                    return [
                      ...prev.slice(0, tabIndex),
                      { ...item, disabled: true },
                      ...prev.slice(tabIndex + 1),
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
                opacity: isActive ? 0.8 : 1,
              }}
            />
          </SwipeableItem>
        </ScaleDecorator>
      )
    },
    [enabledTabs],
  )

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (enabledTabs.length === 0) {
        e.preventDefault()
        Alert.alert('你需要至少设置一个首页标签页')
        return
      }
      if (homeTabs !== tabs) {
        update((prev) => ({
          ...prev,
          homeTabs: tabs,
        }))
      }
    })
    return unsubscribe
  }, [navigation, tabs, homeTabs, enabledTabs])

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
          )}
          style={styles.btn_primary.bg}
          onPress={() => {
            sheetRef.current?.present()
          }}>
          <PlusIcon color={styles.btn_primary.text.color} size={22} />
        </Pressable>
      </View>
      <AddTabPanelSheet
        extraItems={disabledTabs}
        ref={sheetRef}
        onSelect={(item) => {
          setTabs((prev) => {
            const relatedItemIndex = prev.findIndex(
              (t) => t.type === item.type && t.value === item.value,
            )
            if (relatedItemIndex > -1) {
              return [
                item,
                ...prev.slice(0, relatedItemIndex),
                ...prev.slice(relatedItemIndex + 1),
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
