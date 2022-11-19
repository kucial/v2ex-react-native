import { useCallback, useMemo, useRef } from 'react'
import { RefreshControl, SectionList, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import colors from 'tailwindcss/colors'
import { useColorScheme } from 'tailwindcss-react-native'

import SearchInput from '@/components/SearchInput'
import { useAuthService } from '@/containers/AuthService'
import { useCachedState } from '@/hooks'
import { isRefreshing, useSWR } from '@/utils/swr'

import CollectedNodes from './CollectedNodes'
import CommonNodes from './CommonNodes'

const CACHE_KEY = '$app$/nodes-filter'

export default function NodesScreen({ navigation }) {
  const { status } = useAuthService()
  const { colorScheme } = useColorScheme()

  const [filter, setFilter] = useCachedState(CACHE_KEY, '')

  const hasAuthed = status === 'authed'
  const collectedNodesSwr = useSWR(hasAuthed ? '/page/my/nodes.json' : null, {
    revalidateOnMount: false,
  })
  const commonNodesSwr = useSWR('/page/planes/node-groups.json', {
    revalidateOnMount: false,
  })

  const filterInput = useRef()
  const listRef = useRef()

  const { sections, renderItem } = useMemo(() => {
    return {
      sections: [
        collectedNodesSwr.data?.data
          ? {
              title: '收藏的节点',
              data: [
                {
                  type: 'self',
                  name: 'collected',
                  nodes: collectedNodesSwr.data.data,
                },
              ],
            }
          : null,
        commonNodesSwr.data?.map((group) => ({
          title: group.title,
          data: [
            {
              type: 'public',
              name: group.name,
              nodes: filter
                ? group.nodes.filter(
                    (node) =>
                      node.name.match(new RegExp(filter, 'i')) ||
                      node.title.match(new RegExp(filter, 'i')),
                  )
                : group.nodes,
            },
          ],
        })),
      ]
        .flat()
        .filter((section) => !!section && !!section.data[0].nodes.length),
      renderItem: ({ item }) => {
        switch (item.type) {
          case 'public':
            return (
              <View className="mx-1 bg-white dark:bg-neutral-900 rounded-b-sm shadow mb-4">
                <CommonNodes data={item.nodes} filter={filter} />
              </View>
            )
          case 'self':
            return (
              <View className="mx-1 bg-white dark:bg-neutral-900 rounded-b-sm shadow mb-4">
                <CollectedNodes data={item.nodes} />
              </View>
            )
          default:
            return (
              <View>
                <Text>UNKNOWN</Text>
              </View>
            )
        }
      },
    }
  }, [commonNodesSwr.data, collectedNodesSwr.data, filter])

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = navigation.addListener('tabPress', (e) => {
        if (sections.length) {
          listRef.current?.scrollToLocation({
            viewOffset: 0,
            animated: true,
            itemIndex: 0,
            sectionIndex: 0,
          })
        }
      })

      return unsubscribe
    }, [sections]),
  )

  return (
    <View className="flex-1">
      <View className="bg-white dark:bg-neutral-900 mb-1">
        <SearchInput
          placeholder="查询"
          initialValue={filter}
          ref={filterInput}
          onSubmit={(text) => {
            setFilter(text.trim())
          }}
          onReset={() => {
            setFilter('')
          }}
        />
      </View>
      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={(item) => {
          return item.name
        }}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => {
          return (
            <View className="mx-1">
              <View className="bg-white dark:bg-neutral-900 flex flex-row justify-between items-center border-b border-b-neutral-400 px-3 dark:border-neutral-600 rounded-t-sm">
                <View className="py-2">
                  <Text className="font-medium dark:text-neutral-300">
                    {section.title}
                  </Text>
                </View>
              </View>
            </View>
          )
        }}
        refreshControl={
          <RefreshControl
            tintColor={
              colorScheme === 'dark' ? colors.neutral[300] : colors.neutral[900]
            }
            refreshing={
              isRefreshing(commonNodesSwr) ||
              (hasAuthed && isRefreshing(collectedNodesSwr))
            }
            onRefresh={() => {
              if (hasAuthed) {
                collectedNodesSwr?.mutate()
              }
              commonNodesSwr?.mutate()
            }}
          />
        }
      />
    </View>
  )
}
