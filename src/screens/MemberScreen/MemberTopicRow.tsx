import { Pressable, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import classNames from 'classnames'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { BlockText, InlineBox } from '@/components/Skeleton/Elements'
import TriangleCorner from '@/components/TriangleCorner'
import { useTheme } from '@/containers/ThemeService'

export default function MemberTopicRow(props: MemberFeedRowProps) {
  const { data, isLast } = props
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()
  const { styles } = useTheme()
  return (
    <MaxWidthWrapper style={styles.layer1}>
      <Pressable
        className="flex flex-row items-center active:opacity-60"
        style={!isLast && styles.border_b_light}
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
                  <Text style={[styles.text_meta, styles.text_xs]}>
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
              <Text
                className={classNames({
                  'font-[500]': props.titleStyle === 'emphasized',
                })}
                style={[styles.text, styles.text_base]}>
                {data.title}
              </Text>
            ) : (
              <BlockText style={styles.text_base} lines={[1, 3]} />
            )}

            <View className="mt-2 flex flex-row">
              <Text style={[styles.text_meta, styles.text_xs]}>
                {data?.last_reply_time}
              </Text>
              {data?.last_reply_by && (
                <>
                  <Text className="px-2" style={styles.text_meta}>
                    •
                  </Text>
                  <View className="flex flex-row items-center">
                    <Text style={[styles.text_meta, styles.text_xs]}>
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
                        className="font-[600]"
                        style={[styles.text_meta, styles.text_xs]}>
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
            <View className="rounded-full px-2" style={[styles.tag__bg]}>
              <Text style={styles.tag__text}>{data.replies}</Text>
            </View>
          )}
          {!data && (
            <InlineBox
              className="rounded-full px-2"
              style={styles.text_xs}
              width={[26, 36]}
            />
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
    </MaxWidthWrapper>
  )
}
