import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'

import ErrorNotice from '@/components/ErrorNotice'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { BlockText } from '@/components/Skeleton/Elements'

import { usePadLayout } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import ApiError from '@/utils/v2ex-client/ApiError'
import { TopicBasic, TopicDetail } from '@/utils/v2ex-client/types'

import TopicInfo from './TopicInfo'

function TopicBaseInfo(props: {
  data?: TopicDetail
  error?: Error | ApiError
  isLoading?: boolean
  hasReply?: boolean
  fallback?: TopicBasic
  contentWidth: number
  onAppend(): void
  onEdit(): void
  onChangeNode(): void
  onRefetch(): void
}) {
  const { styles } = useTheme()
  const padLayout = usePadLayout()
  const { data, error, isLoading } = props
  const topic = data || (props.fallback as TopicDetail)
  const isFallback = topic === props.fallback
  const router = useRouter()

  return (
    <>
      <View style={[topicBaseStyles.container, styles.layer1]}>
        <MaxWidthWrapper>
          <View
            style={[
              !padLayout.active && topicBaseStyles.px4,
              props.hasReply && topicBaseStyles.mb2,
              props.hasReply && styles.border_b_light,
            ]}
          >
            {!data && error && !isLoading ? (
              <ErrorNotice
                error={error}
                extra={
                  <View style={topicBaseStyles.errExtra}>
                    {error instanceof ApiError &&
                    error?.code === 'AUTH_REQUIRED' ? (
                      <Pressable
                        style={({ pressed }) => [
                          topicBaseStyles.actionBtn,
                          styles.btn_primary__bg,
                          pressed && topicBaseStyles.pressed60,
                        ]}
                        onPress={() => {
                          router.push('/signin')
                        }}
                      >
                        <Text style={styles.btn_primary__text}>登录</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        style={({ pressed }) => [
                          topicBaseStyles.actionBtn,
                          styles.btn_primary__bg,
                          pressed && topicBaseStyles.pressed60,
                        ]}
                        onPress={props.onRefetch}
                      >
                        <Text style={styles.btn_primary__text}>重试</Text>
                      </Pressable>
                    )}
                  </View>
                }
              />
            ) : (
              <TopicInfo data={topic} contentWidth={props.contentWidth} />
            )}
            {isFallback && isLoading && (
              <View style={topicBaseStyles.mt1}>
                <BlockText lines={[5, 10]} />
              </View>
            )}
            {(topic.canAppend || topic.canEdit || topic.canMove) && (
              <View style={topicBaseStyles.actionsRow}>
                {topic.canAppend && (
                  <Pressable
                    style={({ pressed }) => [
                      topicBaseStyles.smBtn,
                      styles.layer2,
                      pressed && topicBaseStyles.pressed60,
                    ]}
                    onPress={props.onAppend}
                  >
                    <Text style={styles.text}>附言</Text>
                  </Pressable>
                )}
                {topic.canEdit && (
                  <Pressable
                    style={({ pressed }) => [
                      topicBaseStyles.smBtn,
                      topicBaseStyles.ml2,
                      styles.layer2,
                      pressed && topicBaseStyles.pressed60,
                    ]}
                    onPress={props.onEdit}
                  >
                    <Text style={styles.text}>修改</Text>
                  </Pressable>
                )}
                {topic.canMove && (
                  <Pressable
                    style={({ pressed }) => [
                      topicBaseStyles.smBtn,
                      topicBaseStyles.ml2,
                      styles.layer2,
                      pressed && topicBaseStyles.pressed60,
                    ]}
                    onPress={props.onChangeNode}
                  >
                    <Text style={styles.text}>移动</Text>
                  </Pressable>
                )}
              </View>
            )}

            {!!topic.replies || !!topic.clicks ? (
              <View style={topicBaseStyles.statsRow}>
                <Text
                  style={[
                    topicBaseStyles.pr4,
                    styles.text_desc,
                    styles.text_xs,
                  ]}
                >
                  {topic.replies} 条回复
                </Text>
                {topic.clicks && (
                  <Text style={[styles.text_meta, styles.text_xs]}>
                    {topic.clicks} 次点击
                  </Text>
                )}
              </View>
            ) : (
              <View style={topicBaseStyles.py3} />
            )}
          </View>
        </MaxWidthWrapper>
      </View>
    </>
  )
}

const topicBaseStyles = StyleSheet.create({
  container: {
    paddingTop: 12,
  },
  px4: {
    paddingHorizontal: 16,
  },
  mb2: {
    marginBottom: 8,
  },
  errExtra: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionBtn: {
    paddingHorizontal: 16,
    height: 44,
    width: 120,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed60: {
    opacity: 0.6,
  },
  mt1: {
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    position: 'relative',
    bottom: -6,
  },
  smBtn: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ml2: {
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingLeft: 4,
    marginTop: 12,
  },
  pr4: {
    paddingRight: 16,
  },
  py3: {
    paddingVertical: 12,
  },
})

export default memo(TopicBaseInfo)
