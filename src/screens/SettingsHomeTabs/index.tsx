import {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Alert,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native'
import DraggableFlatList, {
  ScaleDecorator,
} from 'react-native-draggable-flatlist'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { useNavigation, useRouter } from 'expo-router'
import type { EventArg } from 'expo-router/react-navigation'

import Button from '@/components/Button'
import V2exIcon from '@/components/icons/V2exIcon'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import NavigationHeader from '@/components/NavigationHeader'
import SectionHeader from '@/components/SectionHeader'

import { useAlertService } from '@/containers/AlertService'
import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { useTabOptions } from '@/hooks'
import { presentSheet } from '@/utils/trueSheet'
import { HomeTabOption } from '@/utils/v2ex-client/types'

import AddTabPanelSheet, { AddTabPanelSheetRef } from './AddTabPanelSheet'

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
      style={({ pressed }) => [
        homeTabsStyles.lineItem,
        styles.layer1,
        props.isFirst && homeTabsStyles.firstRadius,
        props.isLast && homeTabsStyles.lastRadius,
        props.style,
        pressed && homeTabsStyles.pressed,
      ]}
      disabled={props.disabled}
      onLongPress={props.onLongPress}
    >
      <View
        style={[homeTabsStyles.lineContent, !props.isLast && styles.border_b]}
      >
        <View style={homeTabsStyles.lineLeft}>
          {props.icon && <View style={homeTabsStyles.mr3}>{props.icon}</View>}
          <Text style={[styles.text, styles.text_base]}>{props.title}</Text>
        </View>
        {props.extra && (
          <View style={homeTabsStyles.lineExtra}>{props.extra}</View>
        )}
      </View>
    </Pressable>
  )
}

export default function HomeTabs() {
  const router = useRouter()
  const navigation = useNavigation()
  const { theme, styles, colorScheme } = useTheme()
  const {
    data: { homeTabs },
    update,
    initHomeTabs,
  } = useAppSettings()
  const [tabs, setTabs] = useState<HomeTabOption[]>(homeTabs || [])
  const tabOptions = useTabOptions()

  const sheetRef = useRef<AddTabPanelSheetRef>(null)
  const { showActionSheetWithOptions } = useActionSheet()
  const alert = useAlertService()
  const insets = useSafeAreaInsets()

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
        icon = (
          <V2exIcon
            name='rectangle-stack-outline'
            size={18}
            color={tintColor}
          />
        )
      } else {
        icon = (
          <V2exIcon name='home-modern-outline' size={18} color={tintColor} />
        )
      }
      return (
        <ScaleDecorator>
          <MaxWidthWrapper style={homeTabsStyles.px2}>
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
                  style={({ pressed }) => [
                    homeTabsStyles.actionBtn,
                    pressed && homeTabsStyles.pressed50,
                  ]}
                  onPress={() => {
                    setTabs((prev) => {
                      return [
                        ...prev.filter(
                          (t) => t.type !== item.type || t.value !== item.value,
                        ),
                        { ...item, disabled: true },
                      ]
                    })
                  }}
                >
                  <V2exIcon
                    name='minus-circle-outline'
                    color={theme.colors.danger}
                  />
                </Pressable>
              }
            />
          </MaxWidthWrapper>
        </ScaleDecorator>
      )
    },
    [enabledTabs, setTabs, theme],
  )

  const renderDisabledItem = useCallback(
    (item, index) => {
      let icon
      const tintColor = theme.colors.text
      if (item.type === 'node') {
        icon = (
          <V2exIcon
            name='rectangle-stack-outline'
            size={18}
            color={tintColor}
          />
        )
      } else {
        icon = (
          <V2exIcon name='home-modern-outline' size={18} color={tintColor} />
        )
      }
      return (
        <MaxWidthWrapper
          key={`${item.type}-${item.name}`}
          style={homeTabsStyles.px2}
        >
          <LineItem
            title={item.label}
            icon={icon}
            isFirst={index === 0}
            isLast={index === disabledTabs.length - 1}
            extra={
              <Pressable
                style={({ pressed }) => [
                  homeTabsStyles.actionBtn,
                  pressed && homeTabsStyles.pressed50,
                ]}
                onPress={() => {
                  setTabs((prev) => {
                    return [
                      ...prev.filter(
                        (t) => t.type !== item.type || t.value !== item.value,
                      ),
                      { ...item, disabled: false },
                    ]
                  })
                }}
              >
                <V2exIcon
                  name='plus-circle-outline'
                  color={theme.colors.success}
                />
              </Pressable>
            }
          />
        </MaxWidthWrapper>
      )
    },
    [disabledTabs, theme],
  )

  useEffect(() => {
    const unsubscribe = navigation.addListener(
      'beforeRemove',
      (e: EventArg<'beforeRemove', true>) => {
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
      },
    )
    return unsubscribe
  }, [navigation, tabs, homeTabs, enabledTabs, update])

  return (
    <View style={homeTabsStyles.container}>
      <NavigationHeader
        canGoBack
        title='首页标签设置'
        headerRight={() => (
          <Pressable
            style={({ pressed }) => [
              homeTabsStyles.headerRightBtn,
              pressed && homeTabsStyles.pressed60,
            ]}
            onPress={() => {
              // actionsheet
              showActionSheetWithOptions(
                {
                  options: ['取消', '重置'],
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
            }}
          >
            <V2exIcon
              name='ellipsis-horizontal-outline'
              size={24}
              color={theme.colors.text}
            />
          </Pressable>
        )}
      />
      <DraggableFlatList
        containerStyle={{ flex: 1 }}
        activationDistance={10}
        initialNumToRender={20}
        ListHeaderComponent={
          <MaxWidthWrapper style={homeTabsStyles.px2}>
            <SectionHeader title='已启用' desc='长按拖放可调整顺序' />
          </MaxWidthWrapper>
        }
        ListFooterComponent={
          <>
            <MaxWidthWrapper style={homeTabsStyles.px2}>
              <SectionHeader title='已停用' />
            </MaxWidthWrapper>
            {disabledTabs.length ? (
              <View>{disabledTabs.map(renderDisabledItem)}</View>
            ) : (
              <MaxWidthWrapper style={homeTabsStyles.px2}>
                <View style={[homeTabsStyles.emptyBox, styles.layer1]}>
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
      <View style={homeTabsStyles.bottomFloat} pointerEvents='box-none'>
        <Button
          variant='primary'
          style={homeTabsStyles.addBtn}
          radius={31}
          onPress={() => {
            presentSheet(sheetRef.current)
          }}
        >
          <V2exIcon
            name='plus-outline'
            color={styles.btn_primary__text.color}
            size={24}
          />
        </Button>
      </View>
      <AddTabPanelSheet ref={sheetRef} selected={tabs} onChange={setTabs} />
    </View>
  )
}

const homeTabsStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lineItem: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  firstRadius: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  lastRadius: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  pressed: {
    opacity: 0.5,
  },
  lineContent: {
    height: '100%',
    flex: 1,
    flexDirection: 'row',
  },
  lineLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mr3: {
    marginRight: 12,
  },
  lineExtra: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
  },
  px2: {
    paddingHorizontal: 8,
  },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
  },
  pressed50: {
    opacity: 0.5,
  },
  headerRightBtn: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed60: {
    opacity: 0.6,
  },
  emptyBox: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  bottomFloat: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  addBtn: {
    marginBottom: 12,
    width: 62,
    height: 62,
    borderRadius: 31,
  },
})
