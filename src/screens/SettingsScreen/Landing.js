import { View, Text, Pressable } from 'react-native'
import React from 'react'
import { LineItem, LineItemGroup } from '@/components/LineItem'
import { Switch } from 'react-native'

export function SettingsLanding({ navigation }) {
  return (
    <View className="py-2">
      <LineItemGroup>
        <LineItem
          title="首页标签排序"
          onPress={() => {
            navigation.push('home-tabs')
          }}
        />
        <LineItem
          title="显示已读"
          onPress={() => {
            // TODO... UPDATE SETTINGS
          }}
          extra={<Switch />}
          isLast
        />
      </LineItemGroup>
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
