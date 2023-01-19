import { Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import classNames from 'classnames'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useTheme } from '@/containers/ThemeService'

import FixedPressable from '@/components/FixedPressable'
import TimeAgo from '@/components/TimeAgo'

const TideViewedTopicRow = (props: ViewedTopicRowProps) => {
  const { data, showAvatar } = props
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { node, member, title } = data
  const { styles } = useTheme()
  return (
    <FixedPressable
      sentry-label="TideTopicRow"
      className={classNames('flex flex-row items-center', 'active:opacity-50')}
      style={[styles.layer1, styles.border_b, styles.border_light]}
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
            <FastImage
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
        <Text className="text-base leading-[22px]" style={styles.text}>
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
            <Text className="text-xs" style={styles.text_desc}>
              {node.title}
            </Text>
          </FixedPressable>
          <Text className="text-xs mr-2" style={styles.text_meta}>
            上次查看
          </Text>
          <Text className="text-xs" style={styles.text_meta}>
            <TimeAgo date={data.viewed_at} />
          </Text>
        </View>
      </View>
    </FixedPressable>
  )
}

export default TideViewedTopicRow
