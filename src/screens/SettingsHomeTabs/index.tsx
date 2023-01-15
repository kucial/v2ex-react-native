import {
  ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Alert,
  Pressable,
  Text,
  View,
  GestureResponderEvent,
  ViewStyle,
} from 'react-native'
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
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import classNames from 'classnames'

import { useActivityIndicator } from '@/containers/ActivityIndicator'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { useAlertService } from '@/containers/AlertService'
import { HomeTabOption } from '@/types/v2ex'

import AddTabPanelSheet from './AddTabPanelSheet'

const UnderlayLeft = (props: { onDelete: () => void }) => {
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

const LineItem = (props: {
  disabled: boolean
  isLast: boolean
  onLongPress: (e: GestureResponderEvent) => void
  icon: ReactElement
  title: string
  extra?: ReactElement
  style: ViewStyle
}) => {
  const { close, openDirection } = useSwipeableItemParams()
  const { styles } = useTheme()
  return (
    <Pressable
      className={classNames(
        'min-h-[50px] flex flex-row items-center pl-4',
        openDirection !== 'none' &&
          'active:bg-neutral-100 dark:active:bg-neutral-800',
      )}
      style={[styles.layer1, props.style, props.isLast && styles.border_b]}
      onPress={() => {
        if (openDirection !== 'none') {
          close()
        }
      }}
      disabled={props.disabled}
      onLongPress={props.onLongPress}>
      <View
        className={classNames('h-full flex-1 flex flex-row')}
        style={!props.isLast && [styles.border_b]}>
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

type ScreenProps = NativeStackScreenProps<
  AppStackParamList,
  'home-tab-settings'
>

export default function HomeTabs(props: ScreenProps) {
  const { navigation } = props
  const { theme, styles } = useTheme()
  const {
    data: { homeTabs },
    update,
    initHomeTabs,
  } = useAppSettings()
  const [tabs, setTabs] = useState<HomeTabOption[]>(homeTabs || [])
  const sheetRef = useRef<BottomSheetModal>()
  const { showActionSheetWithOptions } = useActionSheet()
  const alert = useAlertService()

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
                  alert.alertWithType(
                    'info',
                    '提示',
                    '正在重新获取首页标签初始设置',
                    undefined,
                    0,
                  )
                  initHomeTabs()
                    .then((newTabs) => {
                      setTabs(newTabs)
                      alert.closeAction(undefined, () => {
                        alert.alertWithType(
                          'success',
                          '成功',
                          '首页标签已重置',
                          undefined,
                          1000,
                        )
                      })
                    })
                    .catch((err) => {
                      alert.closeAction(undefined, () => {
                        alert.alertWithType('error', '错误', err.message)
                      })
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
          style={styles.btn_primary__bg}
          onPress={() => {
            sheetRef.current?.present()
          }}>
          <PlusIcon color={styles.btn_primary__text.color} size={24} />
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
