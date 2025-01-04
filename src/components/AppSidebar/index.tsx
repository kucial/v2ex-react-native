import { ReactNode, useCallback, useMemo } from 'react'
import { StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import {
  ClockIcon,
  DocumentPlusIcon,
  EnvelopeIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  RectangleStackIcon,
  UserIcon,
} from 'react-native-heroicons/outline'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Image } from 'expo-image'

import { APP_SIDEBAR_SIZE } from '@/constants'
import { useAuthService } from '@/containers/AuthService'
import { useCurrentRoute } from '@/containers/NavigationContainer'
import { useTheme } from '@/containers/ThemeService'
import { usePressBreadcrumb } from '@/utils/hooks'

import AppSidebarButton from './AppSidebarButton'
import { LayoutStyleContext } from './context'

interface BarStyles {
  container: {
    common: ViewStyle
    vertical: ViewStyle
  }
  button: {
    layut: ViewStyle
  }
}

export default function AppSidebar(props: {
  dynamic: ReactNode
  hasDynamicContent?: boolean
  position: 'BOTTOM' | 'SIDE'
}) {
  const { composeAuthedNavigation, meta, user } = useAuthService()
  const { theme, styles } = useTheme()
  const { width, height } = useWindowDimensions()
  const currentRoute = useCurrentRoute()
  const navigation = useNavigation<
    NativeStackNavigationProp<AppStackParamList> &
      BottomTabNavigationProp<MainTabParamList>
  >()

  const currentRouteName = currentRoute?.name

  const insets = useSafeAreaInsets()

  const handleNewTopicPress = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        navigation.navigate('new-topic')
      }, []),
    ),
    {
      message: '[AppSidebar] `New-Topic` button pressed',
    },
  )
  const handleNotificationPress = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        navigation.navigate('notification')
      }, [navigation]),
    ),
    {
      message: '[AppSidebar] `Notification` button pressed',
    },
  )
  const handleSearchButtonPress = usePressBreadcrumb(
    useCallback(() => {
      navigation.navigate('search')
    }, []),
    {
      message: '[AppSidebar] `Search` button pressed',
    },
  )
  const handleViewedTopicButtonPress = usePressBreadcrumb(
    useCallback(() => {
      navigation.navigate('viewed-topics')
    }, []),
    {
      message: '[AppSidebar] `Viewed-Topic` button pressed',
    },
  )

  const CurrentUserIcon = useCallback(
    (props: IconProps) => {
      return (
        <Image
          source={{
            uri: user.avatar_normal,
          }}
          style={[
            props.style,
            {
              width: props.size,
              height: props.size,
              borderRadius: 999,
            },
          ]}
        />
      )
    },
    [user],
  )

  const layoutStyles = useMemo(() => {
    return StyleSheet.create({
      wrapper: {
        paddingTop: insets.top,
      },
      container_base: {
        justifyContent: 'space-between',
        display: 'flex',
      },
      container_vertical: {
        flexDirection: 'column',
        width: APP_SIDEBAR_SIZE + insets.left,
        height: '100%',
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
      },
      container_horizontal: {
        flexDirection: 'row',
        minHeight: APP_SIDEBAR_SIZE,
        paddingBottom: insets.bottom,
        width: '100%',
        alignItems: 'center',
      },
      dynamic_wrapper:
        props.position == 'SIDE' && height < 600
          ? {
              position: 'absolute',
              width: '100%',
              top: 0,
              left: insets.left,
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2,
            }
          : {},
      button:
        props.position == 'BOTTOM'
          ? {
              marginHorizontal: 2,
            }
          : {
              marginVertical: height > 500 ? 3 : 0,
            },
    })
  }, [insets, props.position, width, height])

  return (
    <LayoutStyleContext.Provider value={layoutStyles.button}>
      {/* wrapper */}
      <View style={[layoutStyles.wrapper, styles.layer1]}>
        {/* container */}
        <View
          style={[
            layoutStyles.container_base,
            props.position === 'BOTTOM'
              ? layoutStyles.container_horizontal
              : layoutStyles.container_vertical,
            props.position === 'BOTTOM'
              ? styles.border_t_light
              : styles.border_r_light,
          ]}>
          <View
            className={
              props.position === 'BOTTOM'
                ? 'flex-row pl-2 pt-[2] pb-[2]'
                : 'items-center pt-2'
            }>
            <AppSidebarButton
              isActive={currentRouteName == 'feed'}
              label="主题"
              activeColor={theme.colors.primary}
              staticColor={theme.colors.text_desc}
              Icon={HomeIcon}
              onPress={() => {
                navigation.navigate('feed')
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: 'feed',
                    },
                  ],
                })
              }}
            />
            <AppSidebarButton
              isActive={currentRouteName == 'nodes'}
              label="节点"
              activeColor={theme.colors.primary}
              staticColor={theme.colors.text_desc}
              Icon={RectangleStackIcon}
              onPress={() => {
                navigation.navigate('nodes')
              }}
            />
            <AppSidebarButton
              isActive={currentRouteName == 'search'}
              label="搜索"
              activeColor={theme.colors.primary}
              staticColor={theme.colors.text_desc}
              Icon={MagnifyingGlassIcon}
              onPress={handleSearchButtonPress}
            />
            {props.position === 'BOTTOM' && width > 730 && (
              <View
                className="w-[50px] h-[50px]"
                style={layoutStyles.button}></View>
            )}
          </View>

          <View
            style={[
              layoutStyles.dynamic_wrapper,
              props.hasDynamicContent ? styles.layer1 : undefined,
            ]}
            pointerEvents="box-none">
            {props.dynamic}
          </View>

          <View
            className={
              props.position === 'BOTTOM' ? 'flex-row pr-2' : 'items-center'
            }>
            <AppSidebarButton
              isActive={currentRouteName == 'new-topic'}
              label="新主题"
              activeColor={theme.colors.primary}
              staticColor={theme.colors.text_desc}
              Icon={DocumentPlusIcon}
              onPress={handleNewTopicPress}
            />
            <AppSidebarButton
              isActive={currentRouteName == 'viewed-topics'}
              label="历史"
              activeColor={theme.colors.primary}
              staticColor={theme.colors.text_desc}
              Icon={ClockIcon}
              onPress={handleViewedTopicButtonPress}
            />
            <AppSidebarButton
              isActive={currentRouteName == 'notification'}
              label="消息"
              activeColor={theme.colors.primary}
              staticColor={theme.colors.text_desc}
              Icon={EnvelopeIcon}
              badge={meta?.unread_count}
              onPress={handleNotificationPress}
            />
            <AppSidebarButton
              isActive={currentRouteName == 'my'}
              label="我的"
              activeColor={theme.colors.primary}
              staticColor={theme.colors.text_desc}
              Icon={user ? CurrentUserIcon : UserIcon}
              isLast
              onPress={() => {
                navigation.navigate('my')
              }}
            />
          </View>
        </View>
      </View>
    </LayoutStyleContext.Provider>
  )
}
