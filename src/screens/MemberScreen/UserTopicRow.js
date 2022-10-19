import { Pressable, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { BlockText, InlineBox } from '@/components/Skeleton/Elements'

export default function UserTopicRow(props) {
  const { data } = props
  const navigation = useNavigation()
  return (
    <Pressable
      className="border-b border-neutral-200 bg-white flex flex-row items-center active:opacity-60 dark:border-neutral-600 dark:bg-neutral-900"
      onPress={() => {
        if (data) {
          navigation.push('topic', {
            id: props.data.id,
            brief: props.data
          })
        }
      }}>
      <View className="flex-1 py-2 pl-3">
        <View className="flex flex-row items-center space-x-2 mb-1">
          <View>
            {data?.node ? (
              <Pressable
                hitSlop={4}
                className="py-[2px] px-[6px] rounded bg-neutral-100 active:opacity-60 dark:bg-neutral-750"
                onPress={() => {
                  navigation.push('node', {
                    name: data.node.name,
                    brief: data.node
                  })
                }}>
                <Text className="text-neutral-500 text-xs dark:text-neutral-300">
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
            <Text className="text-base text-neutral-700 dark:text-neutral-300">
              {data.title}
            </Text>
          ) : (
            <BlockText className="text-base" lines={[1, 3]} />
          )}

          <View className="mt-2 flex flex-row">
            <Text className="text-xs text-neutral-400">
              {data?.last_reply_time}
            </Text>
            {data?.last_reply_by && (
              <>
                <Text className="text-neutral-400 px-2">•</Text>
                <View className="flex flex-row items-center">
                  <Text className="text-xs text-neutral-400">最后回复来自</Text>
                  <Pressable
                    className="px-1 active:opacity-60"
                    hitSlop={4}
                    onPress={() => {
                      navigation.push('member', {
                        username: data.last_reply_by
                      })
                    }}>
                    <Text className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
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
          <View className="rounded-full text-xs px-2 bg-neutral-400 dark:bg-neutral-600">
            <Text className="text-white dark:text-neutral-300">
              {data.replies}
            </Text>
          </View>
        )}
        {!data && (
          <InlineBox className="rounded-full text-xs px-2" width={[26, 36]} />
        )}
      </View>
    </Pressable>
  )
}
