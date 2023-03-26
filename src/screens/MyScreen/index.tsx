import { useCallback, useEffect } from 'react'
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
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import classNames from 'classnames'
import { Image } from 'expo-image'

import GroupWapper from '@/components/GroupWrapper'
import { LineItem, LineItemGroup } from '@/components/LineItem'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import ReplyIcon from '@/components/ReplyIcon'
import { Box, InlineText } from '@/components/Skeleton/Elements'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'
import { usePressBreadcrumb } from '@/utils/hooks'

import BalanceArea from './BalanceArea'

type ScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'my'>,
  NativeStackScreenProps<AppStackParamList>
>
export default function MyScreen({ navigation }: ScreenProps) {
  const { theme, styles } = useTheme()
  useEffect(() => {
    navigation.setOptions({
      title: '我的',
    })
  }, [])
  const {
    user: currentUser,
    meta: currentUserMeta,
    status: authStatus,
    logout,
    composeAuthedNavigation,
    goToSigninSreen,
  } = useAuthService()

  const handleCreatedTopicsPressed = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        navigation.push('created-topics')
      }, []),
    ),
    {
      message: 'MyScreen `created-topics` button pressed',
    },
  )

  const handleCollectedTopicsPressed = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        navigation.push('collected-topics')
      }, []),
    ),
    {
      message: 'MyScreen `collected-topics` button preseed',
    },
  )

  const handleRepliedTopicsPressed = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        navigation.push('replied-topics')
      }, []),
    ),
    {
      message: 'MyScreen `replied-topics` button pressed',
    },
  )

  let header
  if (currentUser) {
    header = (
      <Pressable
        className="flex flex-row py-3 px-4 active:opacity-60"
        style={styles.layer1}
        onPress={() => {
          navigation.push('profile')
        }}>
        <Image
          source={{ uri: currentUser.avatar_normal }}
          className="w-[40px] h-[40px] bg-neutral-100 mr-3"
        />
        <View className="flex-1">
          <Text
            className="text-base font-semibold mt-[-1px] mb-[1px]"
            style={styles.text}>
            {currentUser.username}
          </Text>
          <View>
            <Text className="text-xs" style={styles.text_meta}>
              V2EX 第 {currentUser.id} 号会员
            </Text>
          </View>
        </View>
        {currentUserMeta?.balance && (
          <Pressable
            className="-mr-2 pl-2 justify-center active:opacity-50"
            onPress={(e) => {
              e.stopPropagation()
              navigation.push('profile', {
                initialTab: 'balance',
              })
            }}>
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
        className="flex flex-row py-3 px-4 items-center active:opacity-60"
        style={styles.layer1}
        onPress={() => {
          goToSigninSreen()
        }}>
        <Box key={authStatus} className="w-[40px] h-[40px] mr-3" />
        <View className="flex-1">
          <Text className="text-base font-semibold mb-1" style={styles.text}>
            未登录
          </Text>
        </View>
      </Pressable>
    )
  } else {
    header = (
      <View className="flex flex-row py-3 px-4" style={styles.layer1}>
        <Box className="w-[40px] h-[40px] mr-3" />
        <View className="flex-1">
          <InlineText
            className="text-base font-semibold mb-1"
            width={[120, 180]}></InlineText>
          <View>
            <InlineText className="text-xs" width={[100, 140]}></InlineText>
          </View>
        </View>
      </View>
    )
  }

  const iconColor = theme.colors.primary

  return (
    <ScrollView className="flex-1 py-3">
      <MaxWidthWrapper className="flex-1">
        <LineItemGroup className="mx-2 my-2">{header}</LineItemGroup>

        <View className="flex flex-wrap flex-row flex-1 mx-1">
          <View className="basis-1/2 px-1 my-2">
            <GroupWapper>
              <LineItem
                title="创建的主题"
                isLast
                icon={<DocumentPlusIcon size={22} color={iconColor} />}
                disabled={authStatus === 'loading'}
                onPress={handleCreatedTopicsPressed}
              />
            </GroupWapper>
          </View>
          <View className="basis-1/2 px-1 my-2">
            <GroupWapper>
              <LineItem
                title="收藏的主题"
                isLast
                icon={<StarIcon size={22} color={iconColor} />}
                disabled={authStatus === 'loading'}
                onPress={handleCollectedTopicsPressed}
              />
            </GroupWapper>
          </View>
          <View className="basis-1/2 px-1 my-2">
            <GroupWapper>
              <LineItem
                title="回复的主题"
                isLast
                icon={<ReplyIcon size={22} color={iconColor} />}
                disabled={authStatus === 'loading'}
                onPress={handleRepliedTopicsPressed}
              />
            </GroupWapper>
          </View>
          <View className="basis-1/2 px-1 my-2">
            <GroupWapper>
              <LineItem
                title="浏览的主题"
                isLast
                icon={<ClockIcon size={22} color={iconColor} />}
                disabled={authStatus === 'loading'}
                onPress={() => {
                  navigation.push('viewed-topics')
                }}
              />
            </GroupWapper>
          </View>
        </View>

        <LineItemGroup className="mx-2 my-2">
          <LineItem
            title="首页 Tab 设置"
            icon={<HomeIcon size={22} color={iconColor} />}
            onPress={() => {
              navigation.push('home-tab-settings')
            }}
          />
          <LineItem
            title="Imgur 图床"
            onPress={() => {
              navigation.push('imgur-settings')
            }}
            icon={<PhotoIcon size={22} color={iconColor} />}
          />
          <LineItem
            title="主题样式"
            icon={<PaintBrushIcon size={22} color={iconColor} />}
            onPress={() => {
              navigation.push('theme-settings')
            }}
          />
          <LineItem
            title="功能设置"
            icon={<Cog6ToothIcon size={22} color={iconColor} />}
            onPress={() => {
              navigation.push('preference-settings')
            }}
            isLast
          />
        </LineItemGroup>

        <LineItemGroup className="mx-2 my-2">
          <LineItem
            onPress={() => {
              navigation.push('about')
            }}
            icon={<InformationCircleIcon size={22} color={iconColor} />}
            title="关于"
            isLast
          />
        </LineItemGroup>

        {currentUser && (
          <View className="mx-2 py-7 mb-4 mt-8 flex-1 justify-end">
            <Pressable
              className={classNames(
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
              }}>
              <Text style={styles.text_danger}>退出登录</Text>
            </Pressable>
          </View>
        )}
      </MaxWidthWrapper>
    </ScrollView>
  )
}
