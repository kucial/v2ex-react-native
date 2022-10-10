import React from 'react'
import { Image, Pressable, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { DocumentIcon } from 'react-native-heroicons/outline'
import { useNavigation } from '@react-navigation/native'
import classNames from 'classnames'

import ErrorNotice from '@/components/ErrorNotice'
import { Box } from '@/components/Skeleton/Elements'
import { isInitLoading, useSWR } from '@/utils/swr'

const isEmpty = (data) => !data.length

export default function CollectedNodes() {
  const navigation = useNavigation()
  const nodesSwr = useSWR('/page/my/nodes.json')

  return (
    <View className="bg-white mx-1 mt-1 mb-4 rounded-sm dark:bg-neutral-900">
      <View className="flex flex-row justify-between items-center border-b border-b-neutral-400 px-3 dark:border-neutral-600">
        <View className="py-2">
          <Text className="font-medium dark:text-neutral-300">收藏的节点</Text>
        </View>
      </View>

      {nodesSwr.error && (
        <ErrorNotice
          error={nodesSwr.error}
          extra={
            <View className="mt-4 flex flex-row justify-center">
              <Pressable
                className="px-4 h-[44px] w-[120px] rounded-full bg-neutral-900 text-white items-center justify-center active:opacity-60 dark:bg-amber-50"
                onPress={() => {
                  nodesSwr.mutate()
                }}>
                <Text className="text-white dark:text-neutral-900">重试</Text>
              </Pressable>
            </View>
          }
        />
      )}
      {!!nodesSwr.data?.data &&
        (isEmpty(nodesSwr.data.data) ? (
          <View className="py-8">
            <Text className="text-center">EMPTY</Text>
          </View>
        ) : (
          <View className="px-1">
            <View className="flex flex-row flex-wrap py-2">
              {nodesSwr.data.data.map((node) => (
                <View key={node.name} className="basis-1/2 px-1 py-1">
                  <Pressable
                    className={classNames(
                      'py-2 px-2 bg-white border border-neutral-400 rounded-lg',
                      'dark:bg-neutral-800 dark:border-neutral-700',
                      'flex flex-row items-center',
                      'active:opacity-60'
                    )}
                    onPress={() => {
                      navigation.navigate('node', {
                        name: node.name
                      })
                    }}>
                    <FastImage
                      className="w-[44px] h-[44px]"
                      source={{ uri: node.avatar_large }}></FastImage>
                    <View className="ml-3 pt-1">
                      <Text className="text-neutral-900 dark:text-neutral-300">
                        {node.title}
                      </Text>
                      <View className="mt-1 flex flex-row items-center">
                        <View className="mr-1">
                          <DocumentIcon size={12} color="#9ca3af" />
                        </View>
                        <Text className="text-xs text-neutral-400">
                          {node.topics}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ))}
      {isInitLoading(nodesSwr) && (
        <View className="px-1">
          <View className="flex flex-row flex-wrap py-2">
            <View className="basis-1/2 px-1 py-1">
              <Box className={classNames('py-2 px-2 rounded-lg')}>
                <View className="w-[44px] h-[44px]" />
              </Box>
            </View>
            <View className="basis-1/2 px-1 py-1">
              <Box className={classNames('py-2 px-2 rounded-lg')}>
                <View className="w-[44px] h-[44px]" />
              </Box>
            </View>
            <View className="basis-1/2 px-1 py-1">
              <Box className={classNames('py-2 px-2 rounded-lg')}>
                <View className="w-[44px] h-[44px]" />
              </Box>
            </View>
            <View className="basis-1/2 px-1 py-1">
              <Box className={classNames('py-2 px-2 rounded-lg')}>
                <View className="w-[44px] h-[44px]" />
              </Box>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
