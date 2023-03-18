import { ReactNode } from 'react'
import { SafeAreaView, View } from 'react-native'
import {
  ClockIcon,
  DocumentPlusIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  RectangleStackIcon,
  UserIcon,
} from 'react-native-heroicons/outline'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useCurrentRoute } from '@/containers/NavigationContainer'
import { useTheme } from '@/containers/ThemeService'

import AppSidebarButton from './AppSidebarButton'

export default function AppSidebar(props: { dynamic: ReactNode }) {
  const { theme, styles } = useTheme()
  const currentRoute = useCurrentRoute()
  const navigation = useNavigation<
    NativeStackNavigationProp<AppStackParamList> &
      BottomTabNavigationProp<MainTabParamList>
  >()

  const currentRouteName = currentRoute?.name

  return (
    <SafeAreaView
      className="flex-1 flex flex-column"
      style={[styles.border_r_light]}>
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
          isActive={currentRouteName == 'my'}
          label="我的"
          activeColor={theme.colors.primary}
          staticColor={theme.colors.text_desc}
          Icon={UserIcon}
          onPress={() => {
            navigation.navigate('my')
          }}
        />
        <AppSidebarButton
          isActive={currentRouteName == 'search'}
          label="搜索"
          activeColor={theme.colors.primary}
          staticColor={theme.colors.text_desc}
          Icon={MagnifyingGlassIcon}
          onPress={() => {
            navigation.navigate('search')
          }}
        />
        <AppSidebarButton
          isActive={currentRouteName == 'viewed-topics'}
          label="历史"
          activeColor={theme.colors.primary}
          staticColor={theme.colors.text_desc}
          Icon={ClockIcon}
          onPress={() => {
            navigation.navigate('viewed-topics')
          }}
        />
        <AppSidebarButton
          isActive={currentRouteName == 'new-topic'}
          label="新主题"
          activeColor={theme.colors.primary}
          staticColor={theme.colors.text_desc}
          Icon={DocumentPlusIcon}
          onPress={() => {
            navigation.navigate('new-topic')
          }}
        />
      </View>

      {props.dynamic}
    </SafeAreaView>
  )
}
