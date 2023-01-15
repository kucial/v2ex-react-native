import { useEffect } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import {
  Cog6ToothIcon,
  DocumentIcon,
  InformationCircleIcon,
  StarIcon,
  PhotoIcon,
  Bars3Icon,
} from 'react-native-heroicons/outline'
import * as StoreReview from 'react-native-store-review'
import classNames from 'classnames'
import { CompositeScreenProps } from '@react-navigation/native'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { LineItem, LineItemGroup } from '@/components/LineItem'
import { Box, InlineText } from '@/components/Skeleton/Elements'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'

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

      <LineItemGroup>
        <LineItem
          title="创建的主题"
          icon={<DocumentIcon size={24} color={iconColor} />}
          disabled={authStatus === 'loading'}
          onPress={composeAuthedNavigation(() => {
            navigation.push('created-topics')
          })}
        />
        <LineItem
          title="收藏的主题"
          icon={<DocumentIcon size={24} color={iconColor} />}
          disabled={authStatus === 'loading'}
          onPress={composeAuthedNavigation(() => {
            navigation.push('collected-topics')
          })}
        />
        <LineItem
          title="回复的主题"
          icon={<DocumentIcon size={24} color={iconColor} />}
          disabled={authStatus === 'loading'}
          onPress={composeAuthedNavigation(() => {
            navigation.push('replied-topics')
          })}
        />
        <LineItem
          title="浏览的主题"
          icon={<DocumentIcon size={24} color={iconColor} />}
          disabled={authStatus === 'loading'}
          isLast
          extra={
            <View className="px-1 py-1 rounded" style={styles.layer2}>
              <Text className="text-xs" style={styles.text_meta}>
                本地缓存
              </Text>
            </View>
          }
          onPress={() => {
            navigation.push('viewed-topics')
          }}
        />
      </LineItemGroup>

      <LineItemGroup>
        <LineItem
          title="主题标签"
          icon={<Bars3Icon size={24} color={iconColor} />}
          onPress={() => {
            navigation.push('home-tab-settings')
          }}
        />
        <LineItem
          title="偏好设置"
          icon={<Cog6ToothIcon size={24} color={iconColor} />}
          onPress={() => {
            navigation.push('preference-settings')
          }}
        />
        <LineItem
          title="Imgur 图床"
          onPress={() => {
            navigation.push('imgur-settings')
          }}
          icon={<PhotoIcon size={24} color={iconColor} />}
          isLast
        />
      </LineItemGroup>

      <LineItemGroup>
        <LineItem
          onPress={() => {
            navigation.push('about')
          }}
          icon={<InformationCircleIcon size={24} color={iconColor} />}
          title="关于"
        />
        <LineItem
          onPress={() => {
            StoreReview.requestReview()
          }}
          icon={<StarIcon size={24} color={iconColor} />}
          title="五星好评"
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
