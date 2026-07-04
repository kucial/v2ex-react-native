import { StyleSheet, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'

import NavigationHeader from '@/components/NavigationHeader'

import Balance from './Balance'
export default function MyBalanceScreen() {
  const params = useLocalSearchParams()
  const username = params.username as string
  return (
    <View style={balanceScreenStyles.container}>
      <NavigationHeader canGoBack title='帐号余额' />
      <Balance username={username} />
    </View>
  )
}

const balanceScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
