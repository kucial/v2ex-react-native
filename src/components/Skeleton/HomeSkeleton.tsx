import { View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

import { InlineText } from './Elements'
import TopicRowSkeleton from './TopicRowSkeleton'

export default function HomeSkeleton() {
  const { styles } = useTheme()
  return (
    <View>
      <View
        className="h-[46px] flex flex-row overflow-hidden"
        style={styles.layer1}>
        <View className="px-[12px] flex flex-row items-center justify-center">
          <InlineText className="text-base" width={[48, 64]} />
        </View>
        <View className="px-[12px] flex flex-row items-center justify-center">
          <InlineText className="text-base" width={[48, 64]} />
        </View>
        <View className="px-[12px] flex flex-row items-center justify-center">
          <InlineText className="text-base" width={[48, 64]} />
        </View>
        <View className="px-[12px] flex flex-row items-center justify-center">
          <InlineText className="text-base" width={[48, 64]} />
        </View>
        <View className="px-[12px] flex flex-row items-center justify-center">
          <InlineText className="text-base" width={[48, 64]} />
        </View>
      </View>
      <View style={[styles.border_top, styles.border_light]}>
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
