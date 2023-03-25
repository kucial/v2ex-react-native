import { ReactNode, useCallback } from 'react'
import { SafeAreaView, View } from 'react-native'
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

import { useAuthService } from '@/containers/AuthService'
import { useCurrentRoute } from '@/containers/NavigationContainer'
import { useTheme } from '@/containers/ThemeService'
import { usePressBreadcrumb } from '@/utils/hooks'

import AppSidebarButton from './AppSidebarButton'

export default function AppSidebar(props: { dynamic: ReactNode }) {
  const { composeAuthedNavigation, meta, user } = useAuthService()
  const { theme, styles } = useTheme()
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

  return (
    <SafeAreaView
      className="flex-1 flex flex-column"
      style={[styles.border_r_light, { justifyContent: 'space-between' }]}>
      <View className="items-center pt-3">
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
      </View>

      <View>{props.dynamic}</View>

      <View className="items-center">
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
  )
}
