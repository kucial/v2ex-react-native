import { useMemo, useState } from 'react'
import { ScrollView, Text, useWindowDimensions, View } from 'react-native'
import { TabBar, TabView } from 'react-native-tab-view'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { APP_SIDEBAR_SIZE } from '@/constants'
import { usePadLayout } from '@/containers/AppSettingsService'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'

import AvatarForm from './AvatarForm'
import Balance from './Balance'
import SettingsForm from './SettingsForm'
import SocialForm from './SocialForm'

const routes = [
  {
    key: 'avatar',
    title: '头像',
  },
  {
    key: 'settings',
    title: '个人主页',
  },
  {
    key: 'social',
    title: '社交网络',
  },
  {
    key: 'balance',
    title: '账户余额',
  },
]

type ScreenProps = NativeStackScreenProps<AppStackParamList, 'profile'>
export default function ProfileScreen(props: ScreenProps) {
  const { user, fetchCurrentUser } = useAuthService()
  const { width, height } = useWindowDimensions()
  const { theme, styles } = useTheme()
  const padLayout = usePadLayout()

  const [index, setIndex] = useState(() => {
    if (props.route.params?.initialTab) {
      const i = routes.findIndex(
        (item) => item.key === props.route.params?.initialTab,
      )
      if (i > -1) {
        return i
      }
    }
    return 0
  })

  const navigationState = useMemo(
    () => ({
      index,
      routes,
    }),
    [index],
  )

  const { renderScene, renderTabBar } = useMemo(() => {
    return {
      renderScene: ({ route }) => {
        const { key } = route
        let scene
        const sceneIndex = routes.findIndex((item) => item.key === key)

        switch (key) {
          case 'settings':
            return (
              <SettingsForm
                isActive={sceneIndex === index}
                username={user.username}
              />
            )
          case 'social':
            return (
              <SocialForm
                isActive={sceneIndex === index}
                username={user.username}
              />
            )
            break
          case 'avatar':
            return (
              <AvatarForm
                isActive={sceneIndex === index}
                username={user.username}
                onUpdated={fetchCurrentUser}
              />
            )
          case 'balance':
            return <Balance username={user.username} />
          default:
            return (
              <ScrollView>
                <MaxWidthWrapper className="py-4 px-2">
                  <View>
                    <Text>{route.title}</Text>
                  </View>
                </MaxWidthWrapper>
              </ScrollView>
            )
        }
      },
      renderTabBar: (props) => {
        return (
          <TabBar
            {...props}
            indicatorStyle={{
              backgroundColor: theme.colors.primary,
            }}
            style={[styles.layer1]}
            tabStyle={{
              flexShrink: 0,
              width: 'auto',
              height: 42,
              paddingTop: 4,
            }}
            contentContainerStyle={{
              display: 'flex',
              flexDirection: 'row',
            }}
            activeColor={theme.colors.primary}
            inactiveColor={theme.colors.text}
            // renderLabel={(props) => {
            //   return (
            //     <Text
            //       style={{
            //         color: props.focused
            //           ? theme.colors.primary
            //           : theme.colors.text,
            //         fontWeight: props.focused ? '600' : '400',
            //         fontSize: 13,
            //       }}>
            //       {props.route.title}
            //     </Text>
            //   )
            // }}
          />
        )
      },
    }
  }, [user.username, styles, index])

  return (
    <TabView
      navigationState={navigationState}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={setIndex}
      initialLayout={{
        width:
          padLayout.active && padLayout.orientation === 'PORTRAIT'
            ? width - APP_SIDEBAR_SIZE
            : width,
        height: height - 50 - 42 - 20,
      }}
    />
  )
}
