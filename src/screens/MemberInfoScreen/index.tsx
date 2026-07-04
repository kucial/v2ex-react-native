import { useCallback } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
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
    <ScrollView style={[memberInfoStyles.container, styles.layer1]}>
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
    <View style={[memberInfoStyles.row, styles.border_b_light]}>
      <View style={memberInfoStyles.labelCol}>
        <Text style={styles.text}>{label}</Text>
      </View>
      <View style={memberInfoStyles.valCol}>
        <Text style={styles.text} selectable>
          {value}
        </Text>
      </View>
    </View>
  )
}

const memberInfoStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  labelCol: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    width: 120,
    flexDirection: 'row',
    alignItems: 'center',
  },
  valCol: {
    paddingVertical: 8,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
})
