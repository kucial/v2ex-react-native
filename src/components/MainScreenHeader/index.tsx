import { useCallback } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import {
  ClockIcon,
  DocumentPlusIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/outline'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { usePadLayout } from '@/containers/AppSettingsService'
import { useComposeAuthedNavigation } from '@/containers/AuthWatcher/hooks'
import { useTheme } from '@/containers/ThemeService'
import { useAuthMeta } from '@/stores/auth'
import { usePressBreadcrumb } from '@/utils/hooks'

import Button from '../Button'

export const useNavigationWithBreadcrumb = (
  component: string,
  action: string,
  route: string,
  requiresAuth = false,
) => {
  const router = useRouter()
  const composeAuthedNavigation = useComposeAuthedNavigation()

  const navigationCallback = useCallback(() => {
    router.push(route as any)
  }, [route])

  const wrapped = requiresAuth
    ? composeAuthedNavigation(navigationCallback)
    : navigationCallback

  return usePressBreadcrumb(wrapped, {
    message: 'Button pressed',
    data: { component, action, route },
  })
}

export default function MainScreenHeader(props) {
  const { options } = props
  const meta = useAuthMeta()
  const { theme, styles } = useTheme()
  const insets = useSafeAreaInsets()
  const padLayout = usePadLayout()

  const handleNewTopicPress = useNavigationWithBreadcrumb(
    'MainScreenHeader',
    'new-topic',
    '/new-topic',
    true,
  )
  const handleNotificationPress = useNavigationWithBreadcrumb(
    'MainScreenHeader',
    'notification',
    '/me/notification',
    true,
  )
  const handleSearchButtonPress = useNavigationWithBreadcrumb(
    'MainScreenHeader',
    'search',
    '/search',
  )
  const handleViewedTopicButtonPress = useNavigationWithBreadcrumb(
    'MainScreenHeader',
    'viewed-topics',
    '/me/viewed-topics',
  )
  const iconColor = theme.colors.text_desc

  const title = options.title
  return (
    <View
      style={[
        mainHeaderStyles.container,
        {
          height: padLayout.active ? insets.top : 48 + insets.top,
          paddingTop: insets.top,
          backgroundColor: theme.colors.bg_layer1,
        },
        props.hasBorder && styles.border_b_light,
      ]}
    >
      {!padLayout.active && (
        <View style={mainHeaderStyles.flex1}>
          <View>
            <Text
              style={[
                mainHeaderStyles.titleText,
                styles.text_lg,
                styles.text_title,
              ]}
            >
              {title}
            </Text>
          </View>
        </View>
      )}

      {!padLayout.active && (
        <View style={mainHeaderStyles.actionsRow}>
          <Button
            style={mainHeaderStyles.iconBtn}
            variant='icon'
            radius={22}
            onPress={handleNewTopicPress}
          >
            <DocumentPlusIcon size={24} color={iconColor} />
          </Button>
          <Button
            style={mainHeaderStyles.iconBtn}
            variant='icon'
            radius={22}
            onPress={handleNotificationPress}
          >
            <View style={mainHeaderStyles.iconWrap}>
              <EnvelopeIcon size={24} color={iconColor} />
              {!!meta?.unread_count && (
                <View
                  style={[
                    mainHeaderStyles.badge,
                    styles.btn_primary__bg,
                    { borderColor: theme.colors.bg_overlay },
                  ]}
                >
                  <Text
                    style={[
                      mainHeaderStyles.badgeText,
                      styles.btn_primary__text,
                    ]}
                  >
                    {meta.unread_count}
                  </Text>
                </View>
              )}
            </View>
          </Button>

          <Button
            style={mainHeaderStyles.iconBtn}
            variant='icon'
            radius={22}
            onPress={handleSearchButtonPress}
          >
            <MagnifyingGlassIcon size={24} color={iconColor} />
          </Button>

          <Button
            style={mainHeaderStyles.iconBtn}
            variant='icon'
            radius={22}
            onPress={handleViewedTopicButtonPress}
          >
            <ClockIcon size={24} color={iconColor} />
          </Button>
        </View>
      )}
    </View>
  )
}

const mainHeaderStyles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  flex1: {
    flex: 1,
  },
  titleText: {
    fontWeight: 'bold',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingRight: 4,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  iconWrap: {
    position: 'relative',
    width: 24,
    height: 24,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    borderRadius: 6,
    minWidth: 12,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'solid',
  },
  badgeText: {
    fontSize: 10,
    textAlign: 'center',
  },
})
