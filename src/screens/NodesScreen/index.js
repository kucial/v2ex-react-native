import { useCallback, useMemo, useRef } from 'react'
import { RefreshControl, SectionList, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'

import SearchInput from '@/components/SearchInput'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'
import { useCachedState } from '@/hooks'
import { isRefreshing, useSWR } from '@/utils/swr'

import CollectedNodes from './CollectedNodes'
import CommonNodes from './CommonNodes'

const CACHE_KEY = '$app$/nodes-filter'

export default function NodesScreen({ navigation }) {
  const { status } = useAuthService()

  const { theme, styles } = useTheme()

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
              <View
                className="mx-1 rounded-b-sm shadow mb-4"
                style={styles.layer1}>
                <CommonNodes data={item.nodes} filter={filter} />
              </View>
            )
          case 'self':
            return (
              <View
                className="mx-1 rounded-b-sm shadow mb-4"
                style={styles.layer1}>
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
      <View className="mb-1" style={styles.layer1}>
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
              <View
                className="flex flex-row justify-between items-center px-3 rounded-t-sm"
                style={[styles.layer1, styles.border_b]}>
                <View className="py-2">
                  <Text className="font-medium" style={styles.text}>
                    {section.title}
                  </Text>
                </View>
              </View>
            </View>
          )
        }}
        refreshControl={
          <RefreshControl
            tintColor={theme.colors.refresh_tint}
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
