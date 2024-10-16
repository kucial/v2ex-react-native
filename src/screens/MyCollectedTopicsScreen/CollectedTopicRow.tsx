import { Pressable, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import classNames from 'classnames'
import { Image } from 'expo-image'

import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { BlockText, Box, InlineBox } from '@/components/Skeleton/Elements'
import { useTheme } from '@/containers/ThemeService'

const CollectedTopicRow = (props: CollectedTopicRowProps) => {
  const { data, isLast } = props
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>()

  const { styles } = useTheme()

  if (!data) {
    return (
      <MaxWidthWrapper style={styles.layer1}>
        <View
          className="flex flex-row items-center p-2"
          style={!isLast && styles.border_b_light}>
          <View className="self-start">
            <Box className="w-[24px] h-[24px] rounded" />
          </View>
          <View className="flex-1 pl-2">
            <View className="">
              <BlockText style={styles.text_base} lines={[1, 3]}></BlockText>
              <View className="mt-2 flex flex-row flex-wrap items-center">
                <BlockText style={styles.text_xs} lines={2} />
              </View>
            </View>
          </View>
          <View className="w-[64px] flex flex-row justify-end pr-1">
            <InlineBox
              className="rounded-full px-2"
              style={styles.text_xs}
              width={[26, 36]}
            />
          </View>
        </View>
      </MaxWidthWrapper>
    )
  }

  return (
    <MaxWidthWrapper style={styles.layer1}>
      <Pressable
        className="flex flex-row items-center p-2 active:opacity-60"
        style={!isLast && styles.border_b_light}
        onPress={() => {
          if (data) {
            navigation.push('topic', {
              id: props.data.id,
              brief: props.data,
            })
          }
        }}>
        <View className="self-start">
          {data.member.avatar_normal ? (
            <Pressable
              onPress={() => {
                navigation.push('member', {
                  username: data.member.username,
                  brief: data.member,
                })
              }}>
              <Image
                recyclingKey={`user:${data.member.username}`}
                className="w-[24px] h-[24px] rounded"
                source={{ uri: data.member.avatar_normal }}
              />
            </Pressable>
          ) : (
            <Box className="w-[24px] h-[24px] rounded" />
          )}
        </View>
        <View className="flex-1 pl-2">
          <View className="">
            <Text
              className={classNames({
                'font-[500]': props.titleStyle === 'emphasized',
              })}
              style={[styles.text, styles.text_base]}>
              {data.title}
            </Text>
            <View className="mt-2 flex flex-row flex-wrap items-center">
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
              <Text className="px-1" style={styles.text_meta}>
                •
              </Text>
              <Pressable
                className="px-1 active:opacity-60"
                hitSlop={4}
                onPress={() => {
                  navigation.push('member', {
                    username: data.member.username,
                  })
                }}>
                <Text
                  className="font-[600]"
                  style={[styles.text_desc, styles.text_xs]}>
                  {data.member.username}
                </Text>
              </Pressable>
              <Text className="px-1" style={styles.text_meta}>
                •
              </Text>

              <Text style={[styles.text_meta, styles.text_xs]}>
                {data?.last_reply_time}
              </Text>
              {data?.last_reply_by && (
                <>
                  <Text className="px-1" style={styles.text_meta}>
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
                          tab: 'replies',
                        })
                      }}>
                      <Text
                        className="font-[600]"
                        style={[styles.text_desc, styles.text_xs]}>
                        {data.last_reply_by}
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
        <View className="w-[64px] flex flex-row justify-end pr-1">
          {data && !!data.replies && (
            <View className="rounded-full px-2" style={styles.tag__bg}>
              <Text style={[styles.tag__text, styles.text_xs]}>
                {data.replies}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </MaxWidthWrapper>
  )
}

export default CollectedTopicRow
