import { Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import classNames from 'classnames'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useTheme } from '@/containers/ThemeService'

import FixedPressable from '@/components/FixedPressable'
import TimeAgo from '@/components/TimeAgo'

const ViewedTopicRow = (props: ViewedTopicRowProps) => {
  const { data, showAvatar } = props
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { node, member, title } = data
  const { styles } = useTheme()
  return (
    <FixedPressable
      className="flex flex-row items-center active:opacity-50"
      style={[styles.layer1, styles.border_b, styles.border_light]}
      onPress={() => {
        navigation.push('topic', {
          id: data.id,
          brief: data,
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

      <View className={classNames('flex-1 py-2')}>
        <View className="flex flex-row items-center pt-[2px] space-x-1 mb-1">
          <View>
            <FixedPressable
              hitSlop={4}
              className="py-[2px] px-[6px] rounded active:opacity-60"
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
          </View>
          <Text style={styles.text_meta}>·</Text>
          <View className="relative top-[1px]">
            <FixedPressable
              className="active:opacity-60"
              hitSlop={5}
              onPress={() => {
                navigation.navigate('member', {
                  username: member.username,
                  brief: member,
                })
              }}>
              <Text className="font-bold text-xs" style={styles.text_desc}>
                {member.username}
              </Text>
            </FixedPressable>
          </View>
        </View>
        <View>
          <Text className="text-base" style={styles.text}>
            {title}
          </Text>
          <View className="mt-2 flex flex-row items-center">
            <Text className="text-xs mr-2" style={styles.text_meta}>
              上次查看
            </Text>
            <Text className="text-xs" style={styles.text_meta}>
              <TimeAgo date={data.viewed_at} />
            </Text>
          </View>
        </View>
      </View>
    </FixedPressable>
  )
}

export default ViewedTopicRow