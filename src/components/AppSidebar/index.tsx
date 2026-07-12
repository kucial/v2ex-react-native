import { ReactNode, useCallback, useMemo } from 'react'
import { StyleSheet, useWindowDimensions, View, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { usePathname, useRouter } from 'expo-router'

import V2exIcon from '@/components/icons/V2exIcon'

import { APP_SIDEBAR_SIZE } from '@/constants'
import { useComposeAuthedNavigation } from '@/containers/AuthWatcher/hooks'
import { useTheme } from '@/containers/ThemeService'
import { useAuthMeta, useCurrentUser } from '@/stores/auth'
import { usePressBreadcrumb } from '@/utils/hooks'

import AppSidebarButton from './AppSidebarButton'
import { LayoutStyleContext } from './context'

export default function AppSidebar(props: {
  dynamic: ReactNode
  hasDynamicContent?: boolean
  position: 'BOTTOM' | 'SIDE'
}) {
  const composeAuthedNavigation = useComposeAuthedNavigation()
  const meta = useAuthMeta()
  const user = useCurrentUser()
  const { theme, styles } = useTheme()
  const { width, height } = useWindowDimensions()
  const pathname = usePathname()
  const router = useRouter()

  const insets = useSafeAreaInsets()

  const handleNewTopicPress = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        router.push('/new-topic')
      }, []),
    ),
    {
      message: '[AppSidebar] `New-Topic` button pressed',
    },
  )
  const handleNotificationPress = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        router.push('/me/notification')
      }, [router]),
    ),
    {
      message: '[AppSidebar] `Notification` button pressed',
    },
  )
  const handleSearchButtonPress = usePressBreadcrumb(
    useCallback(() => {
      router.push('/search')
    }, []),
    {
      message: '[AppSidebar] `Search` button pressed',
    },
  )
  const handleViewedTopicButtonPress = usePressBreadcrumb(
    useCallback(() => {
      router.push('/me/viewed-topics')
    }, []),
    {
      message: '[AppSidebar] `Viewed-Topic` button pressed',
    },
  )
  const handleAudioButtonPress = usePressBreadcrumb(
    useCallback(() => {
      router.push('/audio')
    }, []),
    {
      message: '[AppSidebar] `Audio` button pressed',
    },
  )

  const CurrentUserIcon = useCallback(
    (props: IconProps) => {
      if (!user?.avatar_normal) {
        return <V2exIcon name='user-outline' {...props} />
      }

      return (
        <Image
          source={{
            uri: user.avatar_normal,
          }}
          style={[
            {
              width: props.size,
              height: props.size,
              borderRadius: 999,
            },
          ]}
        />
      )
    },
    [user?.avatar_normal],
  )

  const layoutStyles = useMemo(() => {
    return {
      wrapper:
        props.position === 'SIDE'
          ? {
              paddingTop: insets.top,
            }
          : {},
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
        props.position === 'SIDE' && height < 600
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
        props.position === 'BOTTOM'
          ? {
              marginHorizontal: 2,
            }
          : {
              marginVertical: height > 500 ? 3 : 0,
            },
    } satisfies Record<string, ViewStyle>
  }, [insets.bottom, insets.left, insets.top, props.position, height])

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
          ]}
        >
          <View
            style={
              props.position === 'BOTTOM'
                ? sidebarStyles.topRowBottom
                : sidebarStyles.topRowSide
            }
          >
            <AppSidebarButton
              isActive={pathname === '/feed'}
              label='主题'
              activeColor={theme.colors.primary}
              staticColor={theme.colors.text_desc}
              Icon={(props) => <V2exIcon name='home-outline' {...props} />}
              onPress={() => {
                router.push('/feed')
              }}
            />
            <AppSidebarButton
              isActive={pathname === '/nodes'}
              label='节点'
              activeColor={theme.colors.primary}
              staticColor={theme.colors.text_desc}
              Icon={(props) => (
                <V2exIcon name='rectangle-stack-outline' {...props} />
              )}
              onPress={() => {
                router.push('/nodes')
              }}
            />
            <AppSidebarButton
              isActive={pathname === '/search'}
              label='搜索'
              activeColor={theme.colors.primary}
              staticColor={theme.colors.text_desc}
              Icon={(props) => (
                <V2exIcon name='magnifying-glass-outline' {...props} />
              )}
              onPress={handleSearchButtonPress}
            />
            <AppSidebarButton
              isActive={pathname === '/audio'}
              label='音频'
              activeColor={theme.colors.primary}
              staticColor={theme.colors.text_desc}
              Icon={(props) => (
                <V2exIcon name='musical-note-outline' {...props} />
              )}
              onPress={handleAudioButtonPress}
            />
            {props.position === 'BOTTOM' && width > 730 && (
              <View
                style={[sidebarStyles.spacer50, layoutStyles.button]}
              ></View>
            )}
          </View>

          <View
            style={[
              layoutStyles.dynamic_wrapper,
              props.hasDynamicContent ? styles.layer1 : undefined,
            ]}
            pointerEvents='box-none'
          >
            {props.dynamic}
          </View>

          <View
            style={
              props.position === 'BOTTOM'
                ? sidebarStyles.bottomRowBottom
                : sidebarStyles.bottomRowSide
            }
          >
            <AppSidebarButton
              isActive={pathname === '/new-topic'}
              label='新主题'
              activeColor={theme.colors.primary}
              staticColor={theme.colors.text_desc}
              Icon={(props) => (
                <V2exIcon name='document-plus-outline' {...props} />
              )}
              onPress={handleNewTopicPress}
            />
            <AppSidebarButton
              isActive={pathname === '/me/viewed-topics'}
              label='历史'
              activeColor={theme.colors.primary}
              staticColor={theme.colors.text_desc}
              Icon={(props) => <V2exIcon name='clock-outline' {...props} />}
              onPress={handleViewedTopicButtonPress}
            />
            <AppSidebarButton
              isActive={pathname === '/me/notification'}
              label='消息'
              activeColor={theme.colors.primary}
              staticColor={theme.colors.text_desc}
              Icon={(props) => <V2exIcon name='envelope-outline' {...props} />}
              badge={meta?.unread_count}
              onPress={handleNotificationPress}
            />
            <AppSidebarButton
              isActive={pathname === '/my'}
              label='我的'
              activeColor={theme.colors.primary}
              staticColor={theme.colors.text_desc}
              Icon={
                user
                  ? CurrentUserIcon
                  : (props) => <V2exIcon name='user-outline' {...props} />
              }
              isLast
              onPress={() => {
                router.push('/my')
              }}
            />
          </View>
        </View>
      </View>
    </LayoutStyleContext.Provider>
  )
}

const sidebarStyles = StyleSheet.create({
  topRowBottom: {
    flexDirection: 'row',
    paddingLeft: 8,
    paddingVertical: 2,
  },
  topRowSide: {
    alignItems: 'center',
    paddingTop: 8,
  },
  spacer50: {
    width: 50,
    height: 50,
  },
  bottomRowBottom: {
    flexDirection: 'row',
    paddingRight: 8,
  },
  bottomRowSide: {
    alignItems: 'center',
  },
})
