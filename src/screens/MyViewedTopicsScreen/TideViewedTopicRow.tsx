import { Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import classNames from 'classnames'
import { Image } from 'expo-image'

import FixedPressable from '@/components/FixedPressable'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import TimeAgo from '@/components/TimeAgo'
import { useTheme } from '@/containers/ThemeService'

const TideViewedTopicRow = (props: ViewedTopicRowProps) => {
  const { data, showAvatar, isLast } = props
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { node, member, title } = data
  const { styles } = useTheme()
  return (
    <MaxWidthWrapper style={styles.layer1}>
      <FixedPressable
        sentry-label="TideTopicRow"
        className={classNames(
          'flex flex-row items-center',
          'active:opacity-50',
        )}
        style={!isLast && styles.border_b_light}
        onPress={() => {
          navigation.push('topic', {
            id: props.data.id,
            brief: props.data,
          })
        }}>
        {showAvatar ? (
          <View className="px-2 py-2 self-start">
            <FixedPressable
              onPress={() => {
                navigation.navigate('member', {
                  username: member.username,
                  brief: member,
                })
              }}>
              <Image
                recyclingKey={`user-avatar:${member.username}`}
                source={{
                  uri: member.avatar_normal,
                }}
                className="w-[24px] h-[24px] rounded"
              />
            </FixedPressable>
          </View>
        ) : (
          <View className="pl-3"></View>
        )}
        <View className={classNames('flex-1 pt-1 pb-2')}>
          <Text
            className={classNames({
              'font-[500]': props.titleStyle === 'emphasized',
            })}
            style={[styles.text, styles.text_base]}>
            {title}
          </Text>
          <View className="mt-1 flex flex-row flex-wrap items-center">
            <FixedPressable
              hitSlop={4}
              className="py-[2px] px-[6px] mr-[6px] rounded active:opacity-60"
              style={styles.layer2}
              onPress={() => {
                navigation.navigate('node', {
                  name: node.name,
                  brief: node,
                })
              }}>
              <Text style={[styles.text_desc, styles.text_xs]}>
                {node.title}
              </Text>
            </FixedPressable>
            <Text className="mr-2" style={[styles.text_meta, styles.text_xs]}>
              上次查看
            </Text>
            <Text style={[styles.text_meta, styles.text_xs]}>
              <TimeAgo date={data.viewed_at} />
            </Text>
          </View>
        </View>
      </FixedPressable>
    </MaxWidthWrapper>
  )
}

export default TideViewedTopicRow
