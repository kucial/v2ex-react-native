import { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

import { InlineBox, InlineText, valueInRange } from './Elements'

function NodeSection(props) {
  const { styles } = useTheme()
  const nodes = useMemo(() => {
    if (Array.isArray(props.nodes)) {
      return Math.round(valueInRange(props.nodes))
    }
    return props.nodes
  }, [props.nodes])

  return (
    <View className="mx-1 mt-1 mb-4 rounded-sm shadow" style={styles.layer1}>
      <View className="flex flex-row justify-between items-center border-b border-b-neutral-400 px-3">
        <View className="py-2">
          <InlineText className="font-medium" width={[56, 80]} />
        </View>
        <View className="flex flex-row">
          <InlineText style={styles.text_xs} width={[56, 80]} />
          <Text className="px-1" style={[styles.text_meta, styles.text_xs]}>
            •
          </Text>
          <InlineText style={styles.text_xs} width={64} />
        </View>
      </View>
      <View className="flex flex-row flex-wrap py-2 px-3">
        {[...new Array(nodes)].map((_, index) => (
          <InlineBox
            key={index}
            className="py-2 px-2 rounded-lg mr-2 mb-2"
            style={styles.border}
            width={[56, 80]}></InlineBox>
        ))}
      </View>
    </View>
  )
}

export default function NodesSkeleton() {
  return (
    <ScrollView>
      <NodeSection nodes={110} />
      <NodeSection nodes={700} />
      <NodeSection nodes={120} />
      <NodeSection nodes={89} />
      <NodeSection nodes={50} />
    </ScrollView>
  )
}
