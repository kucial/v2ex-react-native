import { Image, View, Pressable, Text } from 'react-native'
import { SearchIcon, MailIcon } from 'react-native-heroicons/outline'
import Constants from 'expo-constants'
import React from 'react'
import logoImage from '@/assets/logo.png'
import { useAuthService } from '@/containers/AuthService'

export default function MainScreenHeader({ navigation }) {
  const { composeAuthedNavigation, meta } = useAuthService()
  return (
    <View
      className="bg-white w-full flex-row items-center pl-4"
      style={{
        height: 48 + Constants.statusBarHeight,
        paddingTop: Constants.statusBarHeight
      }}>
      <View className="flex-1">
        <Image
          source={logoImage}
          style={{
            width: 47,
            height: 15
          }}
        />
        {/* <Text className="text-lg font-bold">V2EX</Text> */}
      </View>

      <View className="flex flex-row space-x-1 items-center justify-self-end pr-1">
        <Pressable
          className="w-[44px] h-[44px] flex items-center justify-center  rounded-full active:bg-gray-100 active:opacity-60"
          onPress={composeAuthedNavigation(() => {
            navigation.push('notification')
          })}>
          <View className="relative w-[24px] h-[24px]">
            <MailIcon size={24} color={'#333'} />
            {!!meta?.unread_count && (
              <View className="absolute bg-gray-700 top-[-6px] right-[-8px] rounded-md min-w-[12px] px-[3px] text-center border-2 border-white border-solid">
                <Text className="text-white text-[10px]">
                  {meta.unread_count}
                </Text>
              </View>
            )}
          </View>
        </Pressable>

        <Pressable
          className="w-[44px] h-[44px] flex items-center justify-center  rounded-full active:bg-gray-100 active:opacity-60"
          onPress={() => {
            navigation.push('search')
          }}>
          <SearchIcon size={24} color={'#333'} />
        </Pressable>
      </View>
    </View>
  )
}
