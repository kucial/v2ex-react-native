import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { SWRInfiniteResponse } from 'swr/infinite'

import { useTheme } from '@/containers/ThemeService'
import {
  hasReachEnd,
  isEmptyList,
  isLoadingMore,
  shouldShowError,
} from '@/utils/swr'

import Loader from '../Loader'

type CommonListFooterProps = {
  data: SWRInfiniteResponse
  emptyMessage?: string
  isEmpty?: (data: any) => boolean
  hasReachEnd?: boolean
}
export default function CommonListFooter(props: CommonListFooterProps) {
  const { data: listSwr, isEmpty = isEmptyList } = props
  const { styles } = useTheme()
  const insets = useSafeAreaInsets()
  return (
    <View
      sentry-label="ListFooter"
      className="min-h-[60px] flex flex-col items-center justify-center"
      style={{ paddingBottom: (insets?.bottom || 4) + 12, paddingTop: 16 }}>
      {isLoadingMore(listSwr) && (
        <View className="w-full flex flex-row items-center justify-center">
          <Loader />
        </View>
      )}
      {shouldShowError(listSwr) && (
        <View className="w-full px-4 items-center">
          <View className="my-4">
            <Text style={styles.text}>{listSwr.error.message}</Text>
          </View>
          {listSwr.error.code !== 'member_locked' && (
            <View className="flex flex-row justify-center mb-4">
              <Pressable
                className="px-4 h-[44px] w-[120px] rounded-full items-center justify-center active:opacity-60"
                style={styles.btn_primary__bg}
                onPress={() => {
                  listSwr.mutate()
                }}>
                <Text style={styles.btn_primary__text}>重试</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
      {(props.hasReachEnd || hasReachEnd(listSwr)) &&
        (isEmpty(listSwr) ? (
          <View className="w-full flex flex-row justify-center py-4">
            <Text style={styles.text_meta}>
              {props.emptyMessage || '还没有内容哦'}
            </Text>
          </View>
        ) : (
          <View className="w-full flex flex-row justify-center py-4">
            <Text style={styles.text_meta}>到达底部啦</Text>
          </View>
        ))}
    </View>
  )
}
