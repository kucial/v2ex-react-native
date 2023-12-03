import { memo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import classNames from 'classnames'

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
  navigation: NativeStackNavigationProp<AppStackParamList>
  onAppend(): void
  onEdit(): void
  onChangeNode(): void
  onRefetch(): void
}) {
  const { styles } = useTheme()
  const padLayout = usePadLayout()
  const { data, error, navigation, isLoading } = props
  const topic = data || (props.fallback as TopicDetail)
  const isFallback = topic === props.fallback

  return (
    <>
      <View className="pt-3" style={[styles.layer1]}>
        <MaxWidthWrapper>
          <View
            className={classNames({
              'px-4': !padLayout.active,
              'mb-2': props.hasReply,
            })}
            style={props.hasReply && styles.border_b_light}>
            {!data && error && !isLoading ? (
              <ErrorNotice
                error={error}
                extra={
                  <View className="mt-2 flex flex-row justify-center">
                    {error instanceof ApiError &&
                    error?.code === 'AUTH_REQUIRED' ? (
                      <Pressable
                        className={classNames(
                          'px-4 h-[44px] w-[120px] rounded-full items-center justify-center',
                          'active:opacity-60',
                        )}
                        style={[styles.btn_primary__bg]}
                        onPress={() => {
                          navigation.navigate('signin')
                        }}>
                        <Text style={styles.btn_primary__text}>登录</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        className={classNames(
                          'px-4 h-[44px] w-[120px] rounded-full items-center justify-center',
                          'active:opacity-60',
                        )}
                        style={[styles.btn_primary__bg]}
                        onPress={props.onRefetch}>
                        <Text style={styles.btn_primary__text}>重试</Text>
                      </Pressable>
                    )}
                  </View>
                }
              />
            ) : (
              <TopicInfo data={topic} navigation={navigation} />
            )}
            {isFallback && isLoading && (
              <View className="mt-1">
                <BlockText lines={[5, 10]} />
              </View>
            )}
            {(topic.canAppend || topic.canEdit || topic.canMove) && (
              <View className="flex flex-row justify-end relative bottom-[-6px]">
                {topic.canAppend && (
                  <Pressable
                    className="px-3 h-[36px] rounded items-center justify-center active:opacity-60"
                    style={styles.layer2}
                    onPress={props.onAppend}>
                    <Text style={styles.text}>附言</Text>
                  </Pressable>
                )}
                {topic.canEdit && (
                  <Pressable
                    className="px-3 h-[36px] rounded items-center justify-center active:opacity-60 ml-2"
                    style={styles.layer2}
                    onPress={props.onEdit}>
                    <Text style={styles.text}>修改</Text>
                  </Pressable>
                )}
                {topic.canMove && (
                  <Pressable
                    className="px-3 h-[36px] rounded items-center justify-center active:opacity-60 ml-2"
                    style={styles.layer2}
                    onPress={props.onChangeNode}>
                    <Text style={styles.text}>移动</Text>
                  </Pressable>
                )}
              </View>
            )}

            {!!topic.replies || !!topic.clicks ? (
              <View className="flex flex-row py-3 pl-1 mt-3">
                <Text className="text-xs pr-4" style={styles.text_desc}>
                  {topic.replies} 条回复
                </Text>
                {topic.clicks && (
                  <Text className="text-xs" style={styles.text_meta}>
                    {topic.clicks} 次点击
                  </Text>
                )}
              </View>
            ) : (
              <View className="py-3" />
            )}
          </View>
        </MaxWidthWrapper>
      </View>
    </>
  )
}

export default memo(TopicBaseInfo)
