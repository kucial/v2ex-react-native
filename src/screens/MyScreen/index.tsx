import { useCallback } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
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
import ReplyIcon from '@/components/ReplyIcon'
import { Box, InlineText } from '@/components/Skeleton/Elements'

import {
  useComposeAuthedNavigation,
  useGoToSigninScreen,
  useLogout,
} from '@/containers/AuthWatcher/hooks'
import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'
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
        className='flex flex-row py-3 px-4 active:opacity-60'
        style={styles.grouped_secondary}
        onPress={() => {
          router.push('/me')
        }}
      >
        <Image
          source={{ uri: currentUser.avatar_normal }}
          className='w-[40px] h-[40px] rounded bg-neutral-100 mr-3'
        />
        <View className='flex-1'>
          <Text
            className='font-semibold mt-[-1px] mb-[1px]'
            style={[styles.text, styles.text_base]}
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
            className='-mr-2 pl-2 justify-center active:opacity-50'
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
        className='flex flex-row py-3 px-4 items-center active:opacity-60'
        style={styles.grouped_secondary}
        onPress={() => {
          goToSigninScreen()
        }}
      >
        <Box key={authStatus} className='w-[40px] h-[40px] rounded mr-3' />
        <View className='flex-1'>
          <Text
            className='font-semibold'
            style={[styles.text, styles.text_base]}
          >
            未登录
          </Text>
        </View>
      </Pressable>
    )
  } else {
    header = (
      <View
        className='flex flex-row py-3 px-4'
        style={styles.grouped_secondary}
      >
        <Box className='w-[40px] h-[40px] mr-3' />
        <View className='flex-1'>
          <InlineText
            className='font-semibold mb-1'
            style={styles.text_base}
            width={[120, 180]}
          ></InlineText>
          <View>
            <InlineText style={styles.text_xs} width={[100, 140]}></InlineText>
          </View>
        </View>
      </View>
    )
  }

  const iconColor = theme.colors.primary

  return (
    <ScrollView className='flex-1 py-3'>
      <MaxWidthWrapper className='flex-1'>
        <LineItemGroup className='mx-2 my-2'>{header}</LineItemGroup>

        <View className='flex flex-wrap flex-row flex-1 mx-1'>
          <View className='w-1/2 px-1 my-2'>
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
          <View className='w-1/2 px-1 my-2'>
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
          <View className='w-1/2 px-1 my-2'>
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
          <View className='w-1/2 px-1 my-2'>
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

        <LineItemGroup className='mx-2 my-2'>
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

        <LineItemGroup className='mx-2 my-2'>
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
        <View className='mx-2 py-7 mb-4 mt-8 flex-1 justify-end'>
          {currentUser && (
            <Pressable
              className={cn(
                'flex flex-row items-center justify-center h-[44px] rounded-md active:opacity-60',
              )}
              style={{ backgroundColor: theme.colors.bg_danger_mask }}
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
  )
}
