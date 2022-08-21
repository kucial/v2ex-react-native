import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { LineItem, LineItemGroup } from '@/components/LineItem'

export function SettingsLanding({ navigation }) {
  return (
    <View className="py-2">
      <LineItemGroup>
        <LineItem
          title="Imgur 图床设置"
          onPress={() => {
            navigation.push('imgur-settings')
          }}
          isLast
        />
      </LineItemGroup>
    </View>
  )
}
