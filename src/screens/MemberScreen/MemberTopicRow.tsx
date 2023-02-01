import { Pressable, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import classNames from 'classnames'

import { BlockText, InlineBox } from '@/components/Skeleton/Elements'
import TriangleCorner from '@/components/TriangleCorner'
import { useTheme } from '@/containers/ThemeService'

export default function MemberTopicRow(props: MemberFeedRowProps) {
  const { data } = props
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { styles } = useTheme()
  return (
    <Pressable
      className="flex flex-row items-center active:opacity-60"
      style={[styles.layer1, styles.border_b, styles.border_light]}
      onPress={() => {
        if (data) {
          navigation.push('topic', {
            id: props.data.id,
            brief: props.data,
          })
        }
      }}>
      <View
        className={classNames(
          'flex-1 py-2 pl-3',
          props.viewedStatus === 'viewed' && 'opacity-70',
        )}>
        <View className="flex flex-row items-center space-x-2 mb-1">
          <View>
            {data?.node ? (
              <Pressable
                hitSlop={4}
                className="py-[2px] px-[6px] rounded active:opacity-60"
                style={styles.layer2}
                onPress={() => {
                  navigation.push('node', {
                    name: data.node.name,
                    brief: data.node,
                  })
                }}>
                <Text className="text-xs" style={styles.text_meta}>
                  {data.node.title}
                </Text>
              </Pressable>
            ) : (
              <InlineBox
                className="py-[2px] px-[6px] rounded"
                width={[50, 80]}></InlineBox>
            )}
          </View>
        </View>
        <View className="">
          {data?.title ? (
            <Text className="text-base" style={styles.text}>
              {data.title}
            </Text>
          ) : (
            <BlockText className="text-base" lines={[1, 3]} />
          )}

          <View className="mt-2 flex flex-row">
            <Text className="text-xs" style={styles.text_meta}>
              {data?.last_reply_time}
            </Text>
            {data?.last_reply_by && (
              <>
                <Text className="px-2" style={styles.text_meta}>
                  •
                </Text>
                <View className="flex flex-row items-center">
                  <Text className="text-xs" style={styles.text_meta}>
                    最后回复来自
                  </Text>
                  <Pressable
                    className="px-1 active:opacity-60"
                    hitSlop={4}
                    onPress={() => {
                      navigation.push('member', {
                        username: data.last_reply_by,
                      })
                    }}>
                    <Text
                      className="text-xs font-bold"
                      style={styles.text_meta}>
                      {data.last_reply_by}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
      <View className="w-[80px] flex flex-row justify-end pr-4">
        {data && !!data.replies && (
          <View className="rounded-full text-xs px-2" style={styles.tag__bg}>
            <Text style={styles.tag__text}>{data.replies}</Text>
          </View>
        )}
        {!data && (
          <InlineBox className="rounded-full text-xs px-2" width={[26, 36]} />
        )}
      </View>
      {props.viewedStatus === 'has_update' && (
        <TriangleCorner
          corner="top-left"
          size={10}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            opacity: 0.9,
          }}
        />
      )}
    </Pressable>
  )
}
