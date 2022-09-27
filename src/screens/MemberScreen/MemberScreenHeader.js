import { View, Text, Image } from 'react-native'
import React from 'react'
import Constants from 'expo-constants'
import colors from 'tailwindcss/colors'

import { Box } from '@/components/Skeleton/Elements'
import BackButton from '@/components/BackButton'
import { localTime } from '@/utils/time'

const AVATAR_SIZE = 68
const HEADER_CANVAS_HEIGHT = 80

export default function MemberScreenHeader({ route, navigation, swr }) {
  const { brief, username } = route.params
  const data = swr.data || brief || { username }
  return (
    <View className="bg-white w-full dark:bg-neutral-900">
      <View
        style={{
          position: 'absolute',
          left: 6,
          top: Constants.statusBarHeight,
          zIndex: 10
        }}>
        <BackButton
          tintColor={colors.neutral[900]}
          onPress={() => {
            navigation.goBack()
          }}
        />
      </View>
      <View className="relative">
        <View
          className="bg-neutral-100 flex flex-row items-end dark:bg-neutral-900"
          style={{
            height: Constants.statusBarHeight + HEADER_CANVAS_HEIGHT
          }}>
          <Image
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            source={{ uri: data.avatar_large }}
            resizeMode="cover"
            blurRadius={10}
          />
          <View
            style={{
              marginLeft: AVATAR_SIZE + 16 + 12
            }}>
            <Text className="text-lg font-medium">{data.username || ''}</Text>
          </View>
        </View>
        <View
          className="absolute"
          style={{
            left: 16,
            bottom: -AVATAR_SIZE / 2
          }}>
          {data.avatar_large ? (
            <Image
              className="w-full h-full rounded-full bg-white border-white dark:border-neutral-900"
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderWidth: 3
              }}
              source={{ uri: data.avatar_large }}
            />
          ) : (
            <Box
              className="rounded-full bg-white"
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE
              }}
            />
          )}
        </View>
      </View>
      <View
        style={{
          marginLeft: AVATAR_SIZE + 16 + 12,
          minHeight: AVATAR_SIZE / 2,
          paddingVertical: 4
        }}>
        <Text className="text-neutral-500 text-sm">
          {data.created && (
            <Text className="mb-1">{localTime(data.created * 1000)} 加入</Text>
          )}
          <Text className="mb-1">{data.tagline}</Text>
          <Text className="mb-1">{data.location}</Text>
          <Text className="mb-1">{data.bio}</Text>
          <Text className="mb-1">{data.website}</Text>
        </Text>
      </View>
    </View>
  )
}
