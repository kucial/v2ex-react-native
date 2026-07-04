import { StyleSheet, View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

import { InlineText } from './Elements'
import TopicRowSkeleton from './TopicRowSkeleton'

export default function HomeSkeleton() {
  const { styles } = useTheme()
  return (
    <View>
      <View style={[homeSkelStyles.headerBar, styles.layer1]}>
        <View style={homeSkelStyles.tabCol}>
          <InlineText style={styles.text_base} width={[48, 64]} />
        </View>
        <View style={homeSkelStyles.tabCol}>
          <InlineText style={styles.text_base} width={[48, 64]} />
        </View>
        <View style={homeSkelStyles.tabCol}>
          <InlineText style={styles.text_base} width={[48, 64]} />
        </View>
        <View style={homeSkelStyles.tabCol}>
          <InlineText style={styles.text_base} width={[48, 64]} />
        </View>
        <View style={homeSkelStyles.tabCol}>
          <InlineText style={styles.text_base} width={[48, 64]} />
        </View>
      </View>
      <View style={[styles.border_t_light]}>
        <TopicRowSkeleton />
        <TopicRowSkeleton />
        <TopicRowSkeleton />
        <TopicRowSkeleton />
        <TopicRowSkeleton />
        <TopicRowSkeleton />
        <TopicRowSkeleton />
        <TopicRowSkeleton />
        <TopicRowSkeleton />
        <TopicRowSkeleton />
        <TopicRowSkeleton />
      </View>
    </View>
  )
}

const homeSkelStyles = StyleSheet.create({
  headerBar: {
    height: 46,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  tabCol: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
