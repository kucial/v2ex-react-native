import { View } from 'react-native'
import classNames from 'classnames'

import { useTheme } from '@/containers/ThemeService'

import { BlockText, InlineBox, InlineText } from './Elements'

export default function NodeTopicRowSkeleton() {
  const { styles } = useTheme()
  return (
    <View
      className={classNames(
        'flex flex-row items-center p-2',
        'active:opacity-60',
      )}
      style={[styles.layer1, styles.border_b_light]}>
      <View className="mr-2 self-start">
        <InlineBox className="w-[24px] h-[24px] rounded" />
      </View>
      <View className="flex-1 relative top-[-2px]">
        <BlockText
          className="font-medium mb-2 leading-none"
          style={styles.text_base}
          lines={[1, 3]}
        />
        <View className="flex flex-row space-x-1">
          <InlineText style={styles.text_xs} width={[58, 80]} />
        </View>
      </View>

      <View className="w-[80px] flex flex-row items-center justify-end pr-2">
        <InlineText
          className="rounded-full px-2 bg-neutral-400"
          style={styles.text_xs}
          width={[18, 32]}
        />
      </View>
    </View>
  )
}
