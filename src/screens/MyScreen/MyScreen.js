import { Image, Text, View, Pressable, Alert } from 'react-native'
import React, { useEffect } from 'react'
import {
  ClockIcon,
  Cog6ToothIcon,
  DocumentIcon,
  PencilSquareIcon,
  PhotoIcon,
  InformationCircleIcon
} from 'react-native-heroicons/outline'
import { useAuthService } from '@/containers/AuthService'
import { InlineText } from '@/components/Skeleton/Elements'
import { LineItem, LineItemGroup } from '@/components/LineItem'

export default function MyScreen({ navigation }) {
  useEffect(() => {
    navigation.setOptions({
      title: '我的'
    })
  }, [])
  const {
    user: currentUser,
    status: authStatus,
    logout,
    composeAuthedNavigation,
    goToSigninSreen
  } = useAuthService()

  useEffect(() => {
    if (authStatus === 'visitor') {
      goToSigninSreen()
    }
  }, [authStatus])

  let header
  switch (authStatus) {
    case 'authed':
      header = (
        <Pressable
          className="flex flex-row py-3 px-4 bg-white active:opacity-60"
          onPress={() => {
            navigation.push('profile')
          }}>
          <Image
            source={{ uri: currentUser.avatar_normal }}
            className="w-[40px] h-[40px] bg-gray-100 mr-3"
          />
          <View className="flex-1">
            <Text className="text-base font-semibold mt-[-1px] mb-[1px]">
              {currentUser.username}
            </Text>
            <View>
              <Text className="text-gray-500 text-xs">
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
          className="flex flex-row py-3 px-4 bg-white items-center active:opacity-60"
          onPress={() => {
            goToSigninSreen()
          }}>
          <Image
            key={authStatus}
            className="w-[40px] h-[40px] bg-gray-100 mr-3"
          />
          <View className="flex-1">
            <Text className="text-base font-semibold mb-1">未登录</Text>
          </View>
        </Pressable>
      )
      break
    case 'loading':
    default:
      header = (
        <View className="flex flex-row py-3 px-4 bg-white">
          <Image className="w-[40px] h-[40px] bg-gray-100 mr-3" />
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

  return (
    <View className="flex flex-col flex-1 py-2">
      <LineItemGroup>{header}</LineItemGroup>

      <LineItemGroup>
        <LineItem
          title="创建的主题"
          icon={<DocumentIcon size={24} color="#111" />}
          disabled={authStatus === 'loading'}
          onPress={composeAuthedNavigation(() => {
            navigation.push('created-topics')
          })}
        />
        <LineItem
          title="收藏的主题"
          icon={<DocumentIcon size={24} color="#111" />}
          disabled={authStatus === 'loading'}
          onPress={composeAuthedNavigation(() => {
            navigation.push('collected-topics')
          })}
        />
        <LineItem
          title="回复的主题"
          icon={<DocumentIcon size={24} color="#111" />}
          disabled={authStatus === 'loading'}
          onPress={composeAuthedNavigation(() => {
            navigation.push('replied-topics')
          })}
        />
        <LineItem
          title="浏览的主题"
          icon={<DocumentIcon size={24} color="#111" />}
          disabled={authStatus === 'loading'}
          extra={
            <View className="bg-gray-100 px-1 py-1 rounded">
              <Text className="text-xs text-gray-500">本地缓存</Text>
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
          icon={<PhotoIcon size={24} color="#111" />}
          onPress={() => {
            alert.alertWithType('error', '错误', '未开发完成')
          }}
        />
        <LineItem
          title="记事本"
          icon={<PencilSquareIcon size={24} color="#111" />}
          onPress={() => {
            alert.alertWithType('error', '错误', '未开发完成')
          }}
        />
        <LineItem
          title="时间轴"
          icon={<ClockIcon size={24} color="#111" />}
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
          icon={<Cog6ToothIcon size={24} color="#111" />}
          title="设置"
        />
        <LineItem
          onPress={() => {
            navigation.push('about')
          }}
          icon={<InformationCircleIcon size={24} color="#111" />}
          title="关于"
          isLast
        />
      </LineItemGroup>

      {currentUser && (
        <View className="px-4 py-8 flex-1 justify-end">
          <Pressable
            className="flex flex-row items-center justify-center h-[44px] rounded-md bg-gray-50 active:opacity-60 active:bg-red-100 "
            onPress={() => {
              Alert.alert('确认要退出登录吗?', '', [
                {
                  text: '确认',
                  onPress: () => logout()
                },
                {
                  text: '取消',
                  style: 'cancel'
                }
              ])
            }}>
            <Text className="text-red-700">退出登录</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
