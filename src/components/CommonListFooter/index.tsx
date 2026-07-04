import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { UseInfiniteQueryResult } from '@tanstack/react-query'

import { useTheme } from '@/containers/ThemeService'
import {
  hasReachEnd,
  isEmptyList,
  isLoadingMore,
  shouldShowError,
} from '@/utils/react-query'
import ApiError from '@/utils/v2ex-client/ApiError'

import Loader from '../Loader'

type CommonListFooterProps = {
  data: UseInfiniteQueryResult
  emptyMessage?: string
  isEmpty?: (data: any) => boolean
  hasReachEnd?: boolean
}
export default function CommonListFooter(props: CommonListFooterProps) {
  const { data: listQuery, isEmpty = isEmptyList } = props
  const { styles } = useTheme()
  const insets = useSafeAreaInsets()
  if (!listQuery.data && !listQuery.error) {
    return null
  }
  return (
    <View
      sentry-label='ListFooter'
      style={[
        footerStyles.container,
        {
          paddingBottom: (insets?.bottom || 4) + 12,
          paddingTop: 16,
        },
      ]}
    >
      {isLoadingMore(listQuery) && (
        <View style={footerStyles.centerRow}>
          <Loader />
        </View>
      )}
      {shouldShowError(listQuery) && (
        <View style={footerStyles.errorWrap}>
          <View style={footerStyles.my4}>
            <Text style={styles.text}>{listQuery.error.message}</Text>
          </View>
          {!['MEMBER_LOCKED', 'RESOURCE_ERROR'].includes(
            (listQuery.error as ApiError).code,
          ) && (
            <View style={footerStyles.retryRow}>
              <Pressable
                style={({ pressed }) => [
                  footerStyles.retryBtn,
                  styles.btn_primary__bg,
                  pressed && footerStyles.pressed,
                ]}
                onPress={() => {
                  listQuery.refetch()
                }}
              >
                <Text style={styles.btn_primary__text}>重试</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
      {(props.hasReachEnd || hasReachEnd(listQuery)) &&
        (isEmpty(listQuery) ? (
          <View style={footerStyles.py4Row}>
            <Text style={styles.text_meta}>
              {props.emptyMessage || '还没有内容哦'}
            </Text>
          </View>
        ) : (
          <View style={footerStyles.py4Row}>
            <Text style={styles.text_meta}>到达底部啦</Text>
          </View>
        ))}
    </View>
  )
}

const footerStyles = StyleSheet.create({
  container: {
    minHeight: 60,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorWrap: {
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  my4: {
    marginVertical: 16,
  },
  retryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 16,
    height: 44,
    width: 120,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  py4Row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
})
