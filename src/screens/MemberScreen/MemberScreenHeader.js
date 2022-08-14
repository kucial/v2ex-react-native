import { View, Text, Image } from 'react-native'
import React from 'react'
import Constants from 'expo-constants'

import BackButton from '@/components/BackButton'
import classNames from 'classnames'

export default function MemberScreenHeader({ route, navigation }) {
  const { brief, username } = route.params
  return (
    <View
      className="bg-white w-full"
      style={[
        {
          paddingTop: Constants.statusBarHeight
        }
      ]}>
      <View
        style={{
          position: 'absolute',
          left: 4,
          top: Constants.statusBarHeight + 3,
          zIndex: 10
        }}>
        <BackButton
          onPress={() => {
            navigation.goBack()
          }}
        />
      </View>

      <View className="mt-6 mb-2 w-full flex flew-row items-center justify-center">
        <View
          className={classNames(
            'w-[80px] h-[80px] rounded-full overflow-hidden',
            {
              'bg-gray-100': !brief?.avatar_large
            }
          )}>
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
