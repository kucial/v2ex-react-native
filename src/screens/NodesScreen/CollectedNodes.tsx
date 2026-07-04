import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { DocumentIcon } from 'react-native-heroicons/outline'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'

import { useTheme } from '@/containers/ThemeService'
import { getAbsoluteUrl } from '@/utils/url'
import { NodeExtra } from '@/utils/v2ex-client/types'

function CollectedNodes(props: { data: NodeExtra[] }) {
  const router = useRouter()
  const { data } = props
  const { theme, styles } = useTheme()

  return (
    <MaxWidthWrapper>
      <View style={collectedNodesStyles.outer}>
        <View
          style={[styles.layer1, collectedNodesStyles.grid]}
        >
          {data.map((node) => (
            <View key={node.name} style={collectedNodesStyles.gridItem}>
              <Pressable
                style={({ pressed }) => [
                  collectedNodesStyles.card,
                  styles.layer2,
                  pressed && collectedNodesStyles.pressed,
                ]}
                onPress={() => {
                  router.push({
                    pathname: '/node/[name]',
                    params: {
                      name: node.name,
                    },
                  })
                }}
              >
                <Image
                  style={collectedNodesStyles.avatar}
                  source={{ uri: getAbsoluteUrl(node.avatar_large) }}
                />
                <View style={collectedNodesStyles.infoCol}>
                  <Text numberOfLines={1} style={styles.text}>
                    {node.title}
                  </Text>
                  <View style={collectedNodesStyles.metaRow}>
                    <View style={collectedNodesStyles.mr1}>
                      <DocumentIcon size={12} color={theme.colors.text_meta} />
                    </View>
                    <Text style={[styles.text_meta, styles.text_xs]}>
                      {node.topics}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </MaxWidthWrapper>
  )
}

const collectedNodesStyles = StyleSheet.create({
  outer: {
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  gridItem: {
    flexBasis: '50%',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  card: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  avatar: {
    width: 40,
    height: 40,
  },
  infoCol: {
    marginLeft: 12,
    paddingTop: 4,
    paddingRight: 4,
    flex: 1,
  },
  metaRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mr1: {
    marginRight: 4,
  },
})

export default memo(CollectedNodes)
