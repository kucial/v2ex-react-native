import { ScrollView, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import useSWR from 'swr'

import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { getMemberDetail } from '@/utils/v2ex-client'

type ScreenProps = NativeStackScreenProps<AppStackParamList, 'member-info'>
export default function MemberInfoScreen(props: ScreenProps) {
  const { username } = props.route.params
  const memberSwr = useSWR(
    [`/page/member/:username/info.json`, username],
    async ([_, username]) => {
      const { data } = await getMemberDetail({ username })
      return data
    },
    {
      onErrorRetry(err) {
        if (err.response?.status === 404) {
          return
        }
      },
    },
  )

  const { styles } = useTheme()

  return (
    <ScrollView className="flex-1" style={styles.layer1}>
      {[
        ['username', '用户名'],
        ['location', '位置'],
        ['tagline', '签名'],
        ['bio', '个人介绍'],
        ['website', '个人网站'],
        ['twitter', 'Twitter'],
        ['github', 'Github'],
        ['btc', 'BTC'],
      ].map((item) => (
        <Field
          label={item[1]}
          key={item[0]}
          value={memberSwr.data?.[item[0]] || '--'}
        />
      ))}
    </ScrollView>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  const { styles } = useTheme()
  const alert = useAlertService()
  return (
    <View className="flex flex-row" style={[styles.border_b_light]}>
      <View className="py-4 px-4 w-[120px] flex flex-row items-center">
        <Text style={styles.text}>{label}</Text>
      </View>
      <View className="py-2 pr-4 flex flex-row items-center flex-1">
        <Text selectable>{value}</Text>
      </View>
    </View>
  )
}
