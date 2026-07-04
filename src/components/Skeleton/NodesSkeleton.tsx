import { useMemo } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

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
    <View style={[nodeSkelStyles.sectionCard, styles.layer1]}>
      <View style={nodeSkelStyles.headerRow}>
        <View style={nodeSkelStyles.py2}>
          <InlineText
            style={nodeSkelStyles.fontMedium}
            width={[56, 80]}
          />
        </View>
        <View style={nodeSkelStyles.metaRow}>
          <InlineText style={styles.text_xs} width={[56, 80]} />
          <Text
            style={[
              styles.text_meta,
              styles.text_xs,
              nodeSkelStyles.dot,
            ]}
          >
            •
          </Text>
          <InlineText style={styles.text_xs} width={64} />
        </View>
      </View>
      <View style={nodeSkelStyles.grid}>
        {[...new Array(nodes)].map((_, index) => (
          <InlineBox
            key={index}
            style={[styles.border, nodeSkelStyles.nodeBox]}
            width={[56, 80]}
          ></InlineBox>
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

const nodeSkelStyles = StyleSheet.create({
  sectionCard: {
    marginHorizontal: 4,
    marginTop: 4,
    marginBottom: 16,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#a3a3a3',
    paddingHorizontal: 12,
  },
  py2: {
    paddingVertical: 8,
  },
  fontMedium: {
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
  },
  dot: {
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  nodeBox: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
})
