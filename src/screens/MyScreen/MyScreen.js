import { useEffect } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import {
  Cog6ToothIcon,
  DocumentIcon,
  InformationCircleIcon,
} from 'react-native-heroicons/outline'
import classNames from 'classnames'
import colors from 'tailwindcss/colors'
import { useColorScheme } from 'tailwindcss-react-native'

import { LineItem, LineItemGroup } from '@/components/LineItem'
import { Box, InlineText } from '@/components/Skeleton/Elements'
import { useAuthService } from '@/containers/AuthService'

export default function MyScreen({ navigation }) {
  const { colorScheme } = useColorScheme()
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

  useEffect(() => {
    // if (authStatus === 'visitor') {
    //   goToSigninSreen()
    // }
  }, [authStatus])

  let header
  switch (authStatus) {
    case 'authed':
      header = (
        <Pressable
          className="flex flex-row py-3 px-4 bg-white active:opacity-60 dark:bg-neutral-900"
          onPress={() => {
            navigation.push('profile')
          }}>
          <FastImage
            source={{ uri: currentUser.avatar_normal }}
            className="w-[40px] h-[40px] bg-neutral-100 mr-3"
          />
          <View className="flex-1">
            <Text className="text-base font-semibold mt-[-1px] mb-[1px] dark:text-neutral-300">
              {currentUser.username}
            </Text>
            <View>
              <Text className="text-neutral-500 text-xs dark:text-neutral-400">
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
          className="flex flex-row py-3 px-4 bg-white items-center active:opacity-60 dark:bg-neutral-900"
          onPress={() => {
            goToSigninSreen()
          }}>
          <Box key={authStatus} className="w-[40px] h-[40px] mr-3" />
          <View className="flex-1">
            <Text className="text-base font-semibold mb-1 dark:text-neutral-300">
              未登录
            </Text>
          </View>
        </Pressable>
      )
      break
    case 'loading':
    default:
      header = (
        <View className="flex flex-row py-3 px-4 bg-white dark:bg-neutral-900">
          <FastImage className="w-[40px] h-[40px] bg-neutral-100 mr-3" />
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

  const iconColor =
    colorScheme === 'dark' ? colors.neutral[400] : colors.neutral[900]

  return (
    <View className="flex flex-col flex-1 py-2">
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
            <View className="bg-neutral-100 px-1 py-1 rounded dark:bg-neutral-750">
              <Text className="text-xs text-neutral-400">本地缓存</Text>
            </View>
          }
          onPress={() => {
            navigation.push('viewed-topics')
          }}
        />
      </LineItemGroup>

      {/* <LineItemGroup>
        <LineItem
          title="图片库"
          icon={<PhotoIcon size={24} color={iconColor} />}
          onPress={() => {
            alert.alertWithType('error', '错误', '未开发完成')
          }}
        />
        <LineItem
          title="记事本"
          icon={<PencilSquareIcon size={24} color={iconColor} />}
          onPress={() => {
            alert.alertWithType('error', '错误', '未开发完成')
          }}
        />
        <LineItem
          title="时间轴"
          icon={<ClockIcon size={24} color={iconColor} />}
          isLast
          onPress={() => {
            alert.alertWithType('error', '错误', '未开发完成')
          }}
        />
      </LineItemGroup> */}

      <LineItemGroup>
        <LineItem
          disabled={authStatus === 'loading'}
          onPress={() => {
            navigation.push('settings')
          }}
          icon={<Cog6ToothIcon size={24} color={iconColor} />}
          title="设置"
        />
        <LineItem
          onPress={() => {
            navigation.push('about')
          }}
          icon={<InformationCircleIcon size={24} color={iconColor} />}
          title="关于"
          isLast
        />
      </LineItemGroup>

      {currentUser && (
        <View className="px-4 py-8 flex-1 justify-end">
          <Pressable
            className={classNames(
              'flex flex-row items-center justify-center h-[44px] rounded-md bg-neutral-50 active:opacity-60 active:bg-red-100',
              'dark:bg-rose-800/5',
            )}
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
            <Text className="text-red-700 dark:text-rose-300">退出登录</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
