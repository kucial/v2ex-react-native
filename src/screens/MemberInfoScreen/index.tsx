import { useCallback } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'

import { useTheme } from '@/containers/ThemeService'
import { getMemberDetail } from '@/utils/v2ex-client'

export default function MemberInfoScreen() {
  const params = useLocalSearchParams()
  const username = params.username as string

  const fetchMember = useCallback(async () => {
    const { data } = await getMemberDetail({ username })
    return data
  }, [username])

  const memberQuery = useQuery({
    queryKey: [`/page/member/:username/info.json`, username],
    queryFn: fetchMember,
  })

  const { styles } = useTheme()

  return (
    <ScrollView className='flex-1' style={styles.layer1}>
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
          value={memberQuery.data?.[item[0]] || '--'}
        />
      ))}
    </ScrollView>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  const { styles } = useTheme()
  return (
    <View className='flex flex-row' style={[styles.border_b_light]}>
      <View className='py-4 px-4 w-[120px] flex flex-row items-center'>
        <Text style={[styles.text]}>{label}</Text>
      </View>
      <View className='py-2 pr-4 flex flex-row items-center flex-1'>
        <Text selectable>{value}</Text>
      </View>
    </View>
  )
}
