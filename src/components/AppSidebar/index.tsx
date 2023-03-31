import { ReactNode, useCallback, useMemo } from 'react'
import { SafeAreaView, useWindowDimensions, View } from 'react-native'
import {
  ClockIcon,
  DocumentPlusIcon,
  EnvelopeIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  RectangleStackIcon,
  UserIcon,
} from 'react-native-heroicons/outline'
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

export default function AppSidebar(props: {
  dynamic: ReactNode
  position: 'BOTTOM' | 'SIDE'
}) {
  const { composeAuthedNavigation, meta, user } = useAuthService()
  const { theme, styles } = useTheme()
  const { width } = useWindowDimensions()
  const currentRoute = useCurrentRoute()
  const navigation = useNavigation<
    NativeStackNavigationProp<AppStackParamList> &
      BottomTabNavigationProp<MainTabParamList>
  >()

  const currentRouteName = currentRoute?.name

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
        console.log(navigation)
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

  const buttonLayoutStyle = useMemo(() => {
    if (props.position === 'BOTTOM') {
      return {
        marginLeft: 2,
        marginRight: 2,
      }
    }

    return {
      marginTop: 3,
      marginBottom: 3,
    }
  }, [props.position])

  return (
    <LayoutStyleContext.Provider value={buttonLayoutStyle}>
      <SafeAreaView
        style={[
          { justifyContent: 'space-between', display: 'flex' },
          styles.layer1,
          props.position === 'BOTTOM'
            ? styles.border_t_light
            : styles.border_r_light,
          props.position === 'BOTTOM'
            ? {
                flexDirection: 'row',
                minHeight: APP_SIDEBAR_SIZE,
                alignItems: 'center',
              }
            : {
                width: APP_SIDEBAR_SIZE,
                flexDirection: 'column',
              },
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
              style={buttonLayoutStyle}></View>
          )}
        </View>

        <View>{props.dynamic}</View>

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
      </SafeAreaView>
    </LayoutStyleContext.Provider>
  )
}
