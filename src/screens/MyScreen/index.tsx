import { useCallback, useEffect } from 'react'
import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import {
  Bars3Icon,
  ChatBubbleLeftEllipsisIcon,
  ClockIcon,
  Cog6ToothIcon,
  DocumentPlusIcon,
  InformationCircleIcon,
  PhotoIcon,
  StarIcon,
} from 'react-native-heroicons/outline'
import * as StoreReview from 'react-native-store-review'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import classNames from 'classnames'

import { LineItem, LineItemGroup } from '@/components/LineItem'
import ReplyIcon from '@/components/ReplyIcon'
import { Box, InlineText } from '@/components/Skeleton/Elements'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'
import { usePressBreadcrumb } from '@/utils/hooks'

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
  switch (authStatus) {
    case 'authed':
      header = (
        <Pressable
          className="flex flex-row py-3 px-4 active:opacity-60"
          style={styles.layer1}
          onPress={() => {
            navigation.push('profile')
          }}>
          <FastImage
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
        </Pressable>
      )
      break
    case 'visitor':
    case 'logout':
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
      break
    case 'loading':
    default:
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
    <ScrollView className="flex flex-col flex-1 py-2">
      <LineItemGroup>{header}</LineItemGroup>

      <View className="flex flex-wrap flex-row flex-1 mx-2 my-1">
        <View className="basis-1/2 px-2 my-2">
          <LineItem
            title="创建的主题"
            isLast
            className="overflow-hidden rounded-lg shadow-xs"
            icon={<DocumentPlusIcon size={22} color={iconColor} />}
            disabled={authStatus === 'loading'}
            onPress={handleCreatedTopicsPressed}
          />
        </View>
        <View className="basis-1/2 px-2 my-2">
          <LineItem
            title="收藏的主题"
            isLast
            className="overflow-hidden rounded-lg shadow-xs"
            icon={<StarIcon size={22} color={iconColor} />}
            disabled={authStatus === 'loading'}
            onPress={handleCollectedTopicsPressed}
          />
        </View>
        <View className="basis-1/2 px-2 my-2">
          <LineItem
            title="回复的主题"
            isLast
            className="overflow-hidden rounded-lg shadow-xs"
            icon={<ReplyIcon size={22} color={iconColor} />}
            disabled={authStatus === 'loading'}
            onPress={handleRepliedTopicsPressed}
          />
        </View>
        <View className="basis-1/2 px-2 my-2">
          <LineItem
            title="浏览的主题"
            isLast
            className="overflow-hidden rounded-lg shadow-xs"
            icon={<ClockIcon size={22} color={iconColor} />}
            disabled={authStatus === 'loading'}
            onPress={() => {
              navigation.push('viewed-topics')
            }}
          />
        </View>
      </View>

      <LineItemGroup>
        <LineItem
          title="主题标签设置"
          icon={<Bars3Icon size={22} color={iconColor} />}
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
          title="偏好设置"
          icon={<Cog6ToothIcon size={22} color={iconColor} />}
          onPress={() => {
            navigation.push('preference-settings')
          }}
          isLast
        />
      </LineItemGroup>

      <LineItemGroup>
        <LineItem
          onPress={() => {
            navigation.push('about')
          }}
          icon={<InformationCircleIcon size={22} color={iconColor} />}
          title="关于"
        />
        <LineItem
          onPress={() => {
            StoreReview.requestReview()
          }}
          icon={<StarIcon size={22} color={iconColor} />}
          title="五星好评"
        />
        <LineItem
          onPress={() => {
            navigation.push('feedback')
          }}
          icon={<ChatBubbleLeftEllipsisIcon size={22} color={iconColor} />}
          title="意见反馈"
          isLast
        />
      </LineItemGroup>

      {currentUser && (
        <View className="px-4 py-8 mb-4 flex-1 justify-end">
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
    </ScrollView>
  )
}
