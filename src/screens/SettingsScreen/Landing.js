import { View } from 'react-native'

import { LineItem, LineItemGroup } from '@/components/LineItem'

export function SettingsLanding({ navigation }) {
  return (
    <View className="py-2">
      <LineItemGroup>
        <LineItem
          title="首页标签设置"
          onPress={() => {
            navigation.push('home-tab-settings')
          }}
        />
        <LineItem
          title="偏好设置"
          onPress={() => {
            navigation.push('preference-settings')
          }}
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
