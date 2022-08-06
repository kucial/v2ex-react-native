import { Image, Text, View, Pressable } from 'react-native'
import React, { useEffect } from 'react'
import {
  ClockIcon,
  CollectionIcon,
  DocumentIcon,
  PencilAltIcon,
  PhotographIcon
} from 'react-native-heroicons/outline'
import { useAuthService } from '@/containers/AuthServiceProvider'
import { InlineText } from '@/Components/Skeleton/Elements'

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
    if (authStatus === 'failed') {
      goToSigninSreen()
    }
  }, [authStatus])

  let header
  switch (authStatus) {
    case 'loaded':
      header = (
        <Pressable
          className="flex flex-row py-3 px-4 bg-white active:opacity-60"
          onPress={() => {
            navigation.push('member', {
              username: currentUser.username
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
    case 'failed':
    case 'reset':
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
    <View>
      <View className="shadow-sm divide-y divide-gray-300 mb-3">
        <View className="mb-3">{header}</View>
        <Pressable
          className="py-4 px-4 flex flex-row items-center active:opacity-60 bg-white"
          disabled={authStatus === 'loading'}
          onPress={() => {
            if (!currentUser) {
              // TODO....
            }
          }}>
          <View className="mr-3">
            <CollectionIcon size={24} color="#111" />
          </View>
          <Text className="text-base">节点收藏</Text>
        </Pressable>
        <Pressable
          className="py-4 px-4 flex flex-row items-center active:opacity-60 bg-white"
          disabled={authStatus === 'loading'}
          onPress={composeAuthedNavigation(() => {
            navigation.push('my-topics')
          })}>
          <View className="mr-3">
            <DocumentIcon size={24} color="#111" />
          </View>
          <Text className="text-base">主题收藏</Text>
        </Pressable>
      </View>

      <View className="shadow-sm divide-y divide-gray-300 mb-3">
        <Pressable className="py-4 px-4 flex flex-row items-center active:opacity-60 bg-white">
          <View className="mr-3">
            <PhotographIcon size={24} color="#111" />
          </View>
          <Text className="text-base">图片库</Text>
        </Pressable>
        <Pressable className="py-4 px-4 flex flex-row items-center active:opacity-60 bg-white">
          <View className="mr-3">
            <PencilAltIcon size={24} color="#111" />
          </View>
          <Text className="text-base">记事本</Text>
        </Pressable>
        <Pressable className="py-4 px-4 flex flex-row items-center active:opacity-60 bg-white">
          <View className="mr-3">
            <ClockIcon size={24} color="#111" />
          </View>
          <Text className="text-base">时间轴</Text>
        </Pressable>
      </View>

      {currentUser && (
        <View className="px-4 py-6">
          <Pressable
            className="flex flex-row items-center justify-center active:opacity-60 active:bg-red-100 h-[44px] rounded"
            onPress={() => {
              logout()
            }}>
            <Text className="text-red-700">退出登录</Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
