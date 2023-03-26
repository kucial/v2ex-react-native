import { useMemo, useState } from 'react'
import { ScrollView, Text, useWindowDimensions, View } from 'react-native'
import { TabBar, TabView } from 'react-native-tab-view'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { APP_SIDEBAR_WIDTH } from '@/constants'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'
import { usePadLayout } from '@/utils/hooks'

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
        switch (key) {
          case 'settings':
            scene = <SettingsForm username={user.username} />
            break
          case 'social':
            scene = (
              <MaxWidthWrapper>
                <SocialForm username={user.username} />
              </MaxWidthWrapper>
            )
            break
          case 'avatar':
            scene = (
              <AvatarForm
                username={user.username}
                onUpdated={fetchCurrentUser}
              />
            )
            break
          case 'balance':
            return <Balance username={user.username} />
          default:
            scene = (
              <View>
                <Text>{route.title}</Text>
              </View>
            )
        }
        return (
          <ScrollView>
            <MaxWidthWrapper className="py-6">{scene}</MaxWidthWrapper>
          </ScrollView>
        )
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
  }, [user.username, styles])

  return (
    <TabView
      navigationState={navigationState}
      renderScene={renderScene}
      renderTabBar={renderTabBar}
      onIndexChange={setIndex}
      initialLayout={{
        width: padLayout ? width - APP_SIDEBAR_WIDTH : width,
        height: height - 50 - 42 - 20,
      }}
    />
  )
}
