import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'

import { useTheme } from '@/containers/ThemeService'
import { BalanceBrief } from '@/utils/v2ex-client/types'

export default function BalanceArea(props: { data: BalanceBrief }) {
  const { data } = props
  const { styles } = useTheme()

  return (
    <View style={balanceAreaStyles.row}>
      {!!data.gold && (
        <View style={balanceAreaStyles.row}>
          <Image style={balanceAreaStyles.icon} source='gold_coin' />
          <View style={balanceAreaStyles.margin}>
            <Text style={styles.text}>{data.gold}</Text>
          </View>
        </View>
      )}
      {!!data.silver && (
        <View style={balanceAreaStyles.row}>
          <Image style={balanceAreaStyles.icon} source='silver_coin' />
          <View style={balanceAreaStyles.margin}>
            <Text style={styles.text}>{data.silver}</Text>
          </View>
        </View>
      )}
      {!!data.bronze && (
        <View style={balanceAreaStyles.row}>
          <Image style={balanceAreaStyles.icon} source='bronze_coin' />
          <View style={balanceAreaStyles.margin}>
            <Text style={styles.text}>{data.bronze}</Text>
          </View>
        </View>
      )}
    </View>
  )
}

const balanceAreaStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 16,
    height: 16,
  },
  margin: {
    marginHorizontal: 6,
  },
})
