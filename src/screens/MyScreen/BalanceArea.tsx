import { Image, Text, View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'
import { staticAsset } from '@/utils/assets'
import { BalanceBrief } from '@/utils/v2ex-client/types'

export default function BalanceArea(props: { data: BalanceBrief }) {
  const { data } = props
  const { styles } = useTheme()
  return (
    <View className="flex flex-row items-center">
      {!!data.gold && (
        <View className="flex flex-row">
          <Image
            className="w-[16] h-[16]"
            source={{
              uri: staticAsset('gold-coin.png'),
            }}
          />
          <View className="mx-[6]">
            <Text style={styles.text}>{data.gold}</Text>
          </View>
        </View>
      )}
      {!!data.silver && (
        <View className="flex flex-row">
          <Image
            className="w-[16] h-[16]"
            source={{
              uri: staticAsset('silver-coin.png'),
            }}
          />
          <View className="mx-[6]">
            <Text style={styles.text}>{data.silver}</Text>
          </View>
        </View>
      )}
      {!!data.bronze && (
        <View className="flex flex-row">
          <Image
            className="w-[16] h-[16]"
            source={{
              uri: staticAsset('bronze-coin.png'),
            }}
          />
          <View className="mx-[6]">
            <Text style={styles.text}>{data.bronze}</Text>
          </View>
        </View>
      )}
    </View>
  )
}
