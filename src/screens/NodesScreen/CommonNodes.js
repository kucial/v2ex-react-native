import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native'
import React from 'react'
import classNames from 'classnames'
import colors from 'tailwindcss/colors'
import { useColorScheme } from 'tailwindcss-react-native'

import ErrorNotice from '@/components/ErrorNotice'
import NodesSkeleton from '@/components/Skeleton/NodesSkeleton'
import { useSWR } from '@/utils/swr'

export default function Nodes({ navigation, filter }) {
  const nodesSwr = useSWR('/page/planes/node-groups.json')
  const { colorScheme } = useColorScheme()

  if (nodesSwr.error) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            tintColor={
              colorScheme === 'dark' ? colors.neutral[300] : colors.neutral[900]
            }
            refreshing={nodesSwr.isValidating}
            onRefresh={nodesSwr.mutate}
          />
        }>
        <ErrorNotice error={nodesSwr.error} />
      </ScrollView>
    )
  }

  if (!nodesSwr.data) {
    return <NodesSkeleton />
  }

  return (
    <View>
      {nodesSwr.data.map((g) => (
        <View
          className="bg-white dark:bg-neutral-900 mx-1 mt-1 mb-4 rounded-sm shadow"
          key={g.name}>
          <View className="flex flex-row justify-between items-center border-b border-b-neutral-400 px-3 dark:border-b-neutral-600">
            <View className="py-2">
              <Text className="font-medium dark:text-neutral-300">
                {g.title}
              </Text>
            </View>
            <View className="flex flex-row space-x-1">
              <Text className="color-neutral-500 text-xs">{g.name}</Text>
              <Text className="color-neutral-500 text-xs">•</Text>
              <Text className="color-neutral-500 text-xs">
                {g.nodes.length} nodes
              </Text>
            </View>
          </View>
          <View className="flex flex-row flex-wrap py-2 px-3">
            {g.nodes.map((node) => {
              return (
                <Pressable
                  key={node.name}
                  className={classNames(
                    'py-2 px-2 bg-white border border-neutral-400 rounded-lg mr-2 mb-2 active:opacity-60 dark:bg-neutral-800 dark:border-neutral-600',
                    {
                      hidden:
                        filter &&
                        !node.name.match(new RegExp(filter, 'i')) &&
                        !node.title.match(new RegExp(filter, 'i'))
                    }
                  )}
                  onPress={() => {
                    navigation.navigate('node', {
                      name: node.name
                    })
                  }}>
                  <Text className="text-neutral-800 dark:text-neutral-300">
                    {node.title}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>
      ))}
    </View>
  )
}
