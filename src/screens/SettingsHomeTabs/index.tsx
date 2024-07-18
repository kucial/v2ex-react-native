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
import DraggableFlatList, {
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

import Button from '@/components/Button'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import SectionHeader from '@/components/SectionHeader'
import { useAlertService } from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { HomeTabOption } from '@/utils/v2ex-client/types'

import AddTabPanelSheet from './AddTabPanelSheet'

const LineItem = (props: {
  disabled?: boolean
  isFirst: boolean
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
      style={[
        styles.layer1,
        props.isFirst && { borderTopLeftRadius: 4, borderTopRightRadius: 4 },
        props.isLast && {
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
        },
        props.style,
      ]}
      disabled={props.disabled}
      onLongPress={props.onLongPress}>
      <View
        className={classNames('h-full flex-1 flex flex-row')}
        style={!props.isLast && [styles.border_b]}>
        <View className="flex-1 flex flex-row items-center">
          {props.icon && <View className="mr-3">{props.icon}</View>}
          <Text style={[styles.text, styles.text_base]}>{props.title}</Text>
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
                containerStyle: styles.layer1,
              },
              (buttonIndex) => {
                if (buttonIndex === 1) {
                  const instance = alert.show({
                    type: 'info',
                    message: '正在重新获取首页标签初始设置',
                    duration: 0,
                  })
                  initHomeTabs()
                    .then((newTabs) => {
                      setTabs(newTabs)
                      alert.hide(instance)
                      alert.show({
                        type: 'success',
                        message: '首页标签已重置',
                      })
                    })
                    .catch((err) => {
                      alert.hide(instance)
                      alert.show({
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
    ({ item, drag, isActive, getIndex }) => {
      let icon
      const tintColor = theme.colors.text
      if (item.type === 'node') {
        icon = <RectangleStackIcon size={18} color={tintColor} />
      } else {
        icon = <HomeModernIcon size={18} color={tintColor} />
      }
      return (
        <ScaleDecorator>
          <MaxWidthWrapper className="px-2">
            <LineItem
              onLongPress={drag}
              disabled={isActive}
              title={item.label}
              icon={icon}
              isFirst={getIndex() === 0}
              isLast={getIndex() === enabledTabs.length - 1}
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
          </MaxWidthWrapper>
        </ScaleDecorator>
      )
    },
    [enabledTabs, setTabs],
  )

  const renderDisabledItem = useCallback(
    (item, index) => {
      let icon
      const tintColor = theme.colors.text
      if (item.type === 'node') {
        icon = <RectangleStackIcon size={18} color={tintColor} />
      } else {
        icon = <HomeModernIcon size={18} color={tintColor} />
      }
      return (
        <MaxWidthWrapper className="px-2">
          <LineItem
            title={item.label}
            icon={icon}
            isFirst={index === 0}
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
        </MaxWidthWrapper>
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
      <DraggableFlatList
        containerStyle={{ flex: 1 }}
        activationDistance={10}
        ListHeaderComponent={
          <MaxWidthWrapper className="px-2">
            <SectionHeader title="已启用" desc="长按拖放可调整顺序" />
          </MaxWidthWrapper>
        }
        ListFooterComponent={
          <>
            <MaxWidthWrapper className="px-2">
              <SectionHeader title="已停用" />
            </MaxWidthWrapper>
            {disabledTabs.length ? (
              <View>{disabledTabs.map(renderDisabledItem)}</View>
            ) : (
              <MaxWidthWrapper className="px-2">
                <View
                  className="py-4 px-3"
                  style={[styles.layer1, { borderRadius: 4 }]}>
                  <Text style={styles.text}>（空）</Text>
                </View>
              </MaxWidthWrapper>
            )}
            <View style={{ height: 200 }}></View>
          </>
        }
        data={enabledTabs}
        onDragEnd={({ data }) => setTabs([...data, ...disabledTabs])}
        keyExtractor={(item) => `${item.type}-${item.value}`}
        renderItem={renderItem}
      />
      <SafeAreaView
        className="absolute w-full bottom-0 flex flex-row justify-center"
        pointerEvents="box-none">
        <Button
          variant="primary"
          className={classNames(
            'mb-3',
            'w-[62px] h-[62px] rounded-full shadow-sm',
          )}
          radius={31}
          onPress={() => {
            sheetRef.current?.present()
          }}>
          <PlusIcon color={styles.btn_primary__text.color} size={24} />
        </Button>
      </SafeAreaView>
      <AddTabPanelSheet ref={sheetRef} selected={tabs} onChange={setTabs} />
    </>
  )
}
