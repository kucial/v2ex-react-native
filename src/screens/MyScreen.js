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
import { useAlertService } from '@/containers/AlertService'

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
  const alert = useAlertService()

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
            navigation.push('member', {
              username: currentUser.username
              // username: 'Livid'
            })
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
    <View className="flex flex-col flex-1">
      <View className="divide-y divide-gray-300 shadow-sm mb-3">{header}</View>

      <View className="divide-y divide-gray-300 shadow-sm mb-3">
        <Pressable
          className="py-4 px-4 flex flex-row items-center active:opacity-60 bg-white"
          disabled={authStatus === 'loading'}
          onPress={composeAuthedNavigation(() => {
            navigation.push('collected-topics')
          })}>
          <View className="mr-3">
            <DocumentIcon size={24} color="#111" />
          </View>
          <Text className="text-base">收藏的主题</Text>
        </Pressable>
      </View>

      <View className="shadow-sm divide-y divide-gray-300 mb-3">
        <Pressable
          className="py-4 px-4 flex flex-row items-center active:opacity-60 bg-white"
          onPress={() => {
            alert.alertWithType('error', '错误', '未开发完成')
          }}>
          <View className="mr-3">
            <PhotoIcon size={24} color="#111" />
          </View>
          <Text className="text-base">图片库</Text>
        </Pressable>
        <Pressable
          className="py-4 px-4 flex flex-row items-center active:opacity-60 bg-white"
          onPress={() => {
            alert.alertWithType('error', '错误', '未开发完成')
          }}>
          <View className="mr-3">
            <PencilSquareIcon size={24} color="#111" />
          </View>
          <Text className="text-base">记事本</Text>
        </Pressable>
        <Pressable
          className="py-4 px-4 flex flex-row items-center active:opacity-60 bg-white"
          onPress={() => {
            alert.alertWithType('error', '错误', '未开发完成')
          }}>
          <View className="mr-3">
            <ClockIcon size={24} color="#111" />
          </View>
          <Text className="text-base">时间轴</Text>
        </Pressable>
      </View>

      <View className="divide-y divide-gray-300 shadow-sm mb-3">
        <Pressable
          className="py-4 px-4 flex flex-row items-center active:opacity-60 bg-white"
          disabled={authStatus === 'loading'}
          onPress={() => {
            navigation.push('settings')
          }}>
          <View className="mr-3">
            <Cog6ToothIcon size={24} color="#111" />
          </View>
          <Text className="text-base">设置</Text>
        </Pressable>
        <Pressable
          className="py-4 px-4 flex flex-row items-center active:opacity-60 bg-white"
          disabled={authStatus === 'loading'}
          onPress={() => {
            navigation.push('about')
          }}>
          <View className="mr-3">
            <InformationCircleIcon size={24} color="#111" />
          </View>
          <Text className="text-base">关于</Text>
        </Pressable>
      </View>

      {currentUser && (
        <View className="px-4 py-8 flex-1 justify-end">
          <Pressable
            className="flex flex-row items-center justify-center h-[44px] rounded-md active:opacity-60 active:bg-red-100 "
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
