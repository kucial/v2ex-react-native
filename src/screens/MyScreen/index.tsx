import { useCallback } from 'react'
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  ClockIcon,
  Cog6ToothIcon,
  DocumentPlusIcon,
  HomeIcon,
  InformationCircleIcon,
  PaintBrushIcon,
  PhotoIcon,
  StarIcon,
} from 'react-native-heroicons/outline'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import GroupWapper from '@/components/GroupWrapper'
import { LineItem, LineItemGroup } from '@/components/LineItem'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import NavigationHeader from '@/components/NavigationHeader'
import ReplyIcon from '@/components/ReplyIcon'
import { Box, InlineText } from '@/components/Skeleton/Elements'

import {
  useComposeAuthedNavigation,
  useGoToSigninScreen,
  useLogout,
} from '@/containers/AuthWatcher/hooks'
import { useTheme } from '@/containers/ThemeService'
import { useAuthMeta, useAuthStatus, useCurrentUser } from '@/stores/auth'
import { usePressBreadcrumb } from '@/utils/hooks'

import BalanceArea from './BalanceArea'

export default function MyScreen() {
  const router = useRouter()
  const { theme, styles } = useTheme()
  const currentUser = useCurrentUser()
  const currentUserMeta = useAuthMeta()
  const authStatus = useAuthStatus()

  const logout = useLogout()
  const composeAuthedNavigation = useComposeAuthedNavigation()
  const goToSigninScreen = useGoToSigninScreen()

  const handleCreatedTopicsPressed = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        router.push({
          pathname: '/me/created-topics',
        })
      }, [router]),
    ),
    {
      message: 'MyScreen `created-topics` button pressed',
    },
  )

  const handleCollectedTopicsPressed = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        router.push('/me/collected-topics')
      }, [router]),
    ),
    {
      message: 'MyScreen `collected-topics` button pressed',
    },
  )

  const handleRepliedTopicsPressed = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        router.push('/me/replied-topics')
      }, [router]),
    ),
    {
      message: 'MyScreen `replied-topics` button pressed',
    },
  )

  let header
  if (currentUser) {
    header = (
      <Pressable
        style={({ pressed }) => [
          myScreenStyles.headerPressable,
          styles.grouped_secondary,
          pressed && myScreenStyles.pressed,
        ]}
        onPress={() => {
          router.push('/me')
        }}
      >
        <Image
          source={{ uri: currentUser.avatar_normal }}
          style={myScreenStyles.avatar}
        />
        <View style={myScreenStyles.flex1}>
          <Text
            style={[myScreenStyles.username, styles.text, styles.text_base]}
          >
            {currentUser.username}
          </Text>
          <View>
            <Text style={[styles.text_meta, styles.text_xs]}>
              V2EX 第 {currentUser.id} 号会员
            </Text>
          </View>
        </View>
        {currentUserMeta?.balance && (
          <Pressable
            style={({ pressed }) => [
              myScreenStyles.balanceBtn,
              pressed && myScreenStyles.pressed,
            ]}
            onPress={(e) => {
              e.stopPropagation()
              router.push({
                pathname: '/me/balance',
                params: {
                  username: currentUser.username,
                },
              })
            }}
          >
            <BalanceArea data={currentUserMeta.balance} />
          </Pressable>
        )}
      </Pressable>
    )
  } else if (
    authStatus === 'visitor' ||
    authStatus === 'logout' ||
    authStatus === 'failed' ||
    authStatus === 'none'
  ) {
    header = (
      <Pressable
        style={({ pressed }) => [
          myScreenStyles.visitorPressable,
          styles.grouped_secondary,
          pressed && myScreenStyles.pressed,
        ]}
        onPress={() => {
          goToSigninScreen()
        }}
      >
        <Box key={authStatus} style={myScreenStyles.avatarBox} />
        <View style={myScreenStyles.flex1}>
          <Text
            style={[myScreenStyles.username, styles.text, styles.text_base]}
          >
            未登录
          </Text>
        </View>
      </Pressable>
    )
  } else {
    header = (
      <View style={[myScreenStyles.skeletonHeader, styles.grouped_secondary]}>
        <Box style={myScreenStyles.avatarBox} />
        <View style={myScreenStyles.flex1}>
          <InlineText
            style={[myScreenStyles.inlineTextMb, styles.text_base]}
            width={[120, 180]}
          />
          <View>
            <InlineText style={styles.text_xs} width={[100, 140]} />
          </View>
        </View>
      </View>
    )
  }

  const iconColor = theme.colors.primary

  return (
    <View style={myScreenStyles.flex1}>
      <NavigationHeader canGoBack title='我的' shadow={false} />
      <ScrollView
        style={myScreenStyles.scrollView}
        contentContainerStyle={myScreenStyles.scrollContent}
      >
        <MaxWidthWrapper style={myScreenStyles.flex1}>
          <LineItemGroup style={myScreenStyles.groupMargin}>
            {header}
          </LineItemGroup>

          <View style={myScreenStyles.grid}>
            <View style={myScreenStyles.gridItem}>
              <GroupWapper>
                <LineItem
                  style={styles.grouped_secondary}
                  title='创建的主题'
                  isLast
                  icon={<DocumentPlusIcon size={22} color={iconColor} />}
                  disabled={authStatus === 'loading'}
                  onPress={handleCreatedTopicsPressed}
                />
              </GroupWapper>
            </View>
            <View style={myScreenStyles.gridItem}>
              <GroupWapper>
                <LineItem
                  style={styles.grouped_secondary}
                  title='收藏的主题'
                  isLast
                  icon={<StarIcon size={22} color={iconColor} />}
                  disabled={authStatus === 'loading'}
                  onPress={handleCollectedTopicsPressed}
                />
              </GroupWapper>
            </View>
            <View style={myScreenStyles.gridItem}>
              <GroupWapper>
                <LineItem
                  style={styles.grouped_secondary}
                  title='回复的主题'
                  isLast
                  icon={<ReplyIcon size={22} color={iconColor} />}
                  disabled={authStatus === 'loading'}
                  onPress={handleRepliedTopicsPressed}
                />
              </GroupWapper>
            </View>
            <View style={myScreenStyles.gridItem}>
              <GroupWapper>
                <LineItem
                  style={styles.grouped_secondary}
                  title='浏览的主题'
                  isLast
                  icon={<ClockIcon size={22} color={iconColor} />}
                  disabled={authStatus === 'loading'}
                  onPress={() => {
                    router.push('/me/viewed-topics')
                  }}
                />
              </GroupWapper>
            </View>
          </View>

          <LineItemGroup style={myScreenStyles.groupMargin}>
            <LineItem
              style={styles.grouped_secondary}
              title='首页 Tab 设置'
              icon={<HomeIcon size={22} color={iconColor} />}
              onPress={() => {
                router.push('/home-tab-settings')
              }}
            />
            <LineItem
              style={styles.grouped_secondary}
              title='Imgur 图床'
              onPress={() => {
                router.push('/imgur-settings')
              }}
              icon={<PhotoIcon size={22} color={iconColor} />}
            />
            <LineItem
              style={styles.grouped_secondary}
              title='主题样式'
              icon={<PaintBrushIcon size={22} color={iconColor} />}
              onPress={() => {
                router.push('/theme-settings')
              }}
            />
            <LineItem
              style={styles.grouped_secondary}
              title='功能设置'
              icon={<Cog6ToothIcon size={22} color={iconColor} />}
              onPress={() => {
                router.push('/preference-settings')
              }}
              isLast
            />
          </LineItemGroup>

          <LineItemGroup style={myScreenStyles.groupMargin}>
            <LineItem
              style={styles.grouped_secondary}
              onPress={() => {
                router.push('/about')
              }}
              icon={<InformationCircleIcon size={22} color={iconColor} />}
              title='关于'
              isLast
            />
          </LineItemGroup>
          <View style={myScreenStyles.logoutWrap}>
            {currentUser && (
              <Pressable
                style={({ pressed }) => [
                  myScreenStyles.logoutBtn,
                  { backgroundColor: theme.colors.bg_danger_mask },
                  pressed && myScreenStyles.pressed,
                ]}
                onPress={() => {
                  Alert.alert('确认要退出登录吗?', '', [
                    {
                      text: '确认',
                      onPress: () => logout(),
                    },
                    {
                      text: '取消',
                      style: 'cancel',
                    },
                  ])
                }}
              >
                <Text style={styles.text_danger}>退出登录</Text>
              </Pressable>
            )}
          </View>
        </MaxWidthWrapper>
      </ScrollView>
    </View>
  )
}

const myScreenStyles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 12,
  },
  headerPressable: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    marginRight: 12,
  },
  username: {
    fontWeight: '600',
    marginTop: -1,
    marginBottom: 1,
  },
  balanceBtn: {
    marginRight: -8,
    paddingLeft: 8,
    justifyContent: 'center',
  },
  visitorPressable: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  skeletonHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  inlineTextMb: {
    fontWeight: '600',
    marginBottom: 4,
  },
  groupMargin: {
    marginHorizontal: 8,
    marginVertical: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    marginHorizontal: 4,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 4,
    marginVertical: 8,
  },
  logoutWrap: {
    marginHorizontal: 8,
    paddingVertical: 28,
    marginBottom: 16,
    marginTop: 32,
    flex: 1,
    justifyContent: 'flex-end',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 6,
  },
})
