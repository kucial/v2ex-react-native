import { View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

import { BlockText, InlineBox, InlineText } from './Elements'

export default function TopicSkeleton() {
  const { styles } = useTheme()
  return (
    <View className="py-3 px-4 mb-2 shadow-sm" style={styles.layer1}>
      <View className="flex flex-row mb-2">
        <View className="flex flex-row flex-1">
          <InlineBox className="w-[32px] h-[32px] rounded" />
          <View className="pl-2 flex flex-row items-center">
            <View className="py-[2px]">
              <InlineText className="font-medium" width={[60, 80]} />
            </View>
            <View className="ml-2">
              <InlineText style={styles.text_xs} width={[40, 60]} />
            </View>
          </View>
        </View>
        <View>
          <InlineBox
            className="py-1 px-[6px] rounded"
            width={[48, 72]}></InlineBox>
        </View>
      </View>
      <View className="pb-2 mb-2" style={[styles.border_b_light]}>
        <BlockText style={styles.text_lg} lines={[1, 3]} />
      </View>
      <View className="mt-1">
        <BlockText lines={[5, 10]} />
      </View>
    </View>
  )
}
