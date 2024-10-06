import { Text, View } from 'react-native'
import { Image } from 'expo-image'

import { useTheme } from '@/containers/ThemeService'
import { BalanceBrief } from '@/utils/v2ex-client/types'

export default function BalanceArea(props: { data: BalanceBrief }) {
  const { data } = props
  const { styles } = useTheme()

  return (
    <View className="flex flex-row items-center">
      {!!data.gold && (
        <View className="flex flex-row">
          <Image className="w-[16] h-[16]" source="gold_coin" />
          <View className="mx-[6]">
            <Text style={styles.text}>{data.gold}</Text>
          </View>
        </View>
      )}
      {!!data.silver && (
        <View className="flex flex-row">
          <Image className="w-[16] h-[16]" source="silver_coin" />
          <View className="mx-[6]">
            <Text style={styles.text}>{data.silver}</Text>
          </View>
        </View>
      )}
      {!!data.bronze && (
        <View className="flex flex-row">
          <Image className="w-[16] h-[16]" source="bronze_coin" />
          <View className="mx-[6]">
            <Text style={styles.text}>{data.bronze}</Text>
          </View>
        </View>
      )}
    </View>
  )
}
