import { View } from 'react-native'

import { LineItem, LineItemGroup } from '@/components/LineItem'
import { useAppSettings } from '@/containers/AppSettingsService'

export function SettingsLanding({ navigation }) {
  const { data, update } = useAppSettings()
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
          title="显示设置"
          onPress={() => {
            navigation.push('display-settings')
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
