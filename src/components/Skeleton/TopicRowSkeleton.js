import { Text, View } from 'react-native'

import { useTheme } from '@/containers/ThemeService'

import { BlockText, Box, InlineText } from './Elements'

export default function TopicRowSkeleton() {
  const { styles } = useTheme()
  return (
    <View
      className="flex flex-row items-center"
      style={[styles.layer1, styles.border_b, styles.border_light]}>
      <View className="flex-1 py-2 pl-1">
        <View className="flex flex-row items-center space-x-2 pl-1 mb-1">
          <Box className="w-[24px] h-[24px] rounded" />
          <View>
            <View className="py-[2px] rounded w-[50px]">
              <InlineText className="text-xs"></InlineText>
            </View>
          </View>
          <Text style={styles.text_meta}>·</Text>
          <View className="relative">
            <InlineText width={[56, 80]} className="text-xs"></InlineText>
          </View>
        </View>
        <View className="pl-[34px]">
          <BlockText
            randomWidth
            lines={[1, 3]}
            className="text-base"></BlockText>
          <View className="mt-2">
            <InlineText width={[80, 120]} className="text-xs"></InlineText>
          </View>
        </View>
      </View>
      <View className="w-[80px] flex flex-row justify-end pr-4">
        <Box className="rounded-full px-2">
          <InlineText width={8} className="text-xs" />
        </Box>
      </View>
    </View>
  )
}
