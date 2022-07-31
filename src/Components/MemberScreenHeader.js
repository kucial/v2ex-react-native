import { View, Text, Image } from 'react-native'
import React from 'react'
import Constants from 'expo-constants'
import { useTailwind } from 'tailwindcss-react-native'

import BackButton from '@/Components/BackButton'

export default function MemberScreenHeader({ route, navigation }) {
  const tw = useTailwind()
  const { brief, username } = route.params
  return (
    <View
      className="bg-white w-full pl-4"
      style={[
        {
          paddingTop: Constants.statusBarHeight
        }
      ]}>
      <View
        style={{
          position: 'absolute',
          left: 4,
          top: Constants.statusBarHeight + 8,
          zIndex: 10
        }}>
        <BackButton
          onPress={() => {
            navigation.goBack()
          }}
        />
      </View>

      <View className="mt-7 mb-1 w-full flex flew-row items-center justify-center">
        <View
          style={[
            tw('w-[80px] h-[80px] rounded-full overflow-hidden'),
            brief?.avatar_large ? null : tw('bg-gray-100')
          ]}>
          <Image
            className="w-full h-full"
            source={{ uri: brief?.avatar_large }}
          />
        </View>
        <View className="mt-2">
          <Text className="text-lg font-medium">
            {brief?.username || username || ''}
          </Text>
        </View>
      </View>
    </View>
  )
}
