import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import Balance from './Balance'
type ScreenProps = NativeStackScreenProps<AppStackParamList, 'balance'>
export default function MyBalanceScreen(props: ScreenProps) {
  const { username } = props.route.params
  return <Balance username={username} />
}
