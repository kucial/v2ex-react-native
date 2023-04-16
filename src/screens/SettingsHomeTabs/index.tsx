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
  GestureResponderEvent,
  Pressable,
  SafeAreaView,
  Text,
  View,
  ViewStyle,
} from 'react-native'
import {
  NestableDraggableFlatList,
  NestableScrollContainer,
  ScaleDecorator,
} from 'react-native-draggable-flatlist'
import {
  EllipsisHorizontalIcon,
  HomeModernIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  PlusIcon,
  RectangleStackIcon,
} from 'react-native-heroicons/outline'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import classNames from 'classnames'

import GroupWapper from '@/components/GroupWrapper'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import SectionHeader from '@/components/SectionHeader'
import { useAlertService } from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { HomeTabOption } from '@/utils/v2ex-client/types'

import AddTabPanelSheet from './AddTabPanelSheet'

const LineItem = (props: {
  disabled?: boolean
  isLast: boolean
  onLongPress?: (e: GestureResponderEvent) => void
  icon: ReactElement
  title: string
  extra?: ReactElement
  style?: ViewStyle
}) => {
  const { styles } = useTheme()
  return (
    <Pressable
      className={classNames('min-h-[50px] flex flex-row items-center pl-4')}
      style={[styles.layer1, props.style]}
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
  const { theme, styles, colorScheme } = useTheme()
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
                tintColor: theme.colors.primary,
                userInterfaceStyle: colorScheme,
              },
              (buttonIndex) => {
                if (buttonIndex === 1) {
                  const instance = alert.alertWithType({
                    type: 'info',
                    message: '正在重新获取首页标签初始设置',
                    duration: 0,
                  })
                  initHomeTabs()
                    .then((newTabs) => {
                      setTabs(newTabs)
                      instance.manager.destroy()
                      alert.alertWithType({
                        type: 'success',
                        message: '首页标签已重置',
                      })
                    })
                    .catch((err) => {
                      instance.manager.destroy()
                      alert.alertWithType({
                        type: 'error',
                        message: err.message,
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
          <LineItem
            onLongPress={drag}
            disabled={isActive}
            title={item.label}
            icon={icon}
            isLast={index === enabledTabs.length - 1}
            style={{
              opacity: isActive ? 0.8 : 1,
            }}
            extra={
              <Pressable
                className="px-2 py-2 rounded-md active:opacity-50 active:bg-red-100 dark:active:bg-rose-100"
                onPress={() => {
                  setTabs((prev) => {
                    return [
                      ...prev.filter(
                        (t) => t.type !== item.type || t.value !== item.value,
                      ),
                      { ...item, disabled: true },
                    ]
                  })
                }}>
                <MinusCircleIcon color={theme.colors.danger} />
              </Pressable>
            }
          />
        </ScaleDecorator>
      )
    },
    [enabledTabs, setTabs],
  )

  const renderDisabledItem = useCallback(
    ({ item, index }) => {
      let icon
      const tintColor = theme.colors.text
      if (item.type === 'node') {
        icon = <RectangleStackIcon size={18} color={tintColor} />
      } else {
        icon = <HomeModernIcon size={18} color={tintColor} />
      }
      return (
        <LineItem
          title={item.label}
          icon={icon}
          isLast={index === disabledTabs.length - 1}
          extra={
            <Pressable
              className="px-2 py-2 rounded-md active:opacity-50 active:bg-green-100 dark:active:bg-emerald-100"
              onPress={() => {
                setTabs((prev) => {
                  return [
                    ...prev.filter(
                      (t) => t.type !== item.type || t.value !== item.value,
                    ),
                    { ...item, disabled: false },
                  ]
                })
              }}>
              <PlusCircleIcon color={theme.colors.success} />
            </Pressable>
          }
        />
      )
    },
    [disabledTabs],
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
      <NestableScrollContainer>
        <MaxWidthWrapper className="px-2">
          <SectionHeader title="已启用" desc="长按拖放可调整顺序" />
          <GroupWapper style={{ marginRight: 36 }}>
            <NestableDraggableFlatList
              data={enabledTabs}
              onDragEnd={({ data }) => setTabs([...data, ...disabledTabs])}
              keyExtractor={(item) => `${item.type}-${item.value}`}
              renderItem={renderItem}
              activationDistance={5}
              scrollEnabled
            />
          </GroupWapper>
          <SectionHeader title="已停用" />
          <GroupWapper style={{ marginRight: 36 }}>
            {disabledTabs.length ? (
              <NestableDraggableFlatList
                data={disabledTabs}
                keyExtractor={(item) => `${item.type}-${item.value}`}
                renderItem={renderDisabledItem}
              />
            ) : (
              <View className="py-4 px-3" style={styles.layer1}>
                <Text style={styles.text}>（空）</Text>
              </View>
            )}
          </GroupWapper>
        </MaxWidthWrapper>
        <View style={{ height: 200 }}></View>
      </NestableScrollContainer>
      <SafeAreaView
        className="absolute w-full bottom-0 flex flex-row justify-center"
        pointerEvents="box-none">
        <Pressable
          className={classNames(
            'mb-3',
            'w-[62px] h-[62px] items-center justify-center rounded-full shadow-sm active:opacity-60',
          )}
          style={styles.btn_primary__bg}
          onPress={() => {
            sheetRef.current?.snapToIndex(1)
            sheetRef.current?.present()
          }}>
          <PlusIcon color={styles.btn_primary__text.color} size={24} />
        </Pressable>
      </SafeAreaView>
      <AddTabPanelSheet
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
        }}
      />
    </>
  )
}
