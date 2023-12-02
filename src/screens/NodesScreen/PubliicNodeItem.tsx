import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { LineItem } from '@/components/LineItem'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useTheme } from '@/containers/ThemeService'
import { NodeBasic } from '@/utils/v2ex-client/types'

export default function PubliicNodeItem({ data }: { data: NodeBasic }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { styles } = useTheme()

  return (
    <MaxWidthWrapper>
      <View className="mx-1">
        <LineItem
          onPress={() => {
            navigation.navigate('node', {
              name: data.name,
            })
          }}
          style={styles.border_b_light}
          title={data.title}
          isLast
        />
      </View>
    </MaxWidthWrapper>
  )
}
