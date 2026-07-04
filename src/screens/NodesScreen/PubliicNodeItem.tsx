import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'

import { LineItem } from '@/components/LineItem'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'

import { useTheme } from '@/containers/ThemeService'
import { NodeBasic } from '@/utils/v2ex-client/types'

function PubliicNodeItem({ data }: { data: NodeBasic }) {
  const router = useRouter()
  const { styles } = useTheme()

  return (
    <MaxWidthWrapper>
      <View style={publiicNodeStyles.margin}>
        <LineItem
          onPress={() => {
            router.push({
              pathname: '/node/[name]',
              params: {
                name: data.name,
              },
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

const publiicNodeStyles = StyleSheet.create({
  margin: {
    marginHorizontal: 4,
  },
})

export default memo(PubliicNodeItem)
