import { useCallback, useMemo, useRef } from 'react'
import { RefreshControl, SectionList, Text, View } from 'react-native'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { useFocusEffect } from '@react-navigation/native'
import useSWR from 'swr'

import Loader from '@/components/Loader'
import SearchInput from '@/components/SearchInput'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'
import { useCachedState } from '@/utils/hooks'
import { isRefreshing } from '@/utils/swr'
import { getMyCollectedNodes, getNodeGroups } from '@/utils/v2ex-client'

import CollectedNodes from './CollectedNodes'
import CommonNodes from './CommonNodes'

const CACHE_KEY = '$app$/nodes-filter'

type ScreenProps = BottomTabScreenProps<MainTabParamList, 'nodes'>

export default function NodesScreen({ navigation }: ScreenProps) {
  const { status } = useAuthService()

  const { theme, styles } = useTheme()

  const [filter, setFilter] = useCachedState<string>(CACHE_KEY, '')

  const hasAuthed = status === 'authed'
  const collectedNodesSwr = useSWR(
    hasAuthed ? '/page/my/nodes.json' : null,
    getMyCollectedNodes,
  )
  const commonNodesSwr = useSWR('/page/planes/node-groups.json', getNodeGroups)

  const filterInput = useRef()
  const listRef = useRef<SectionList>()

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
        commonNodesSwr.data?.data.map((group) => ({
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
                <CommonNodes data={item.nodes} />
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
      <View className="mb-1 h-[52px]" style={styles.layer1}>
        <SearchInput
          placeholder="筛选"
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
        ListHeaderComponent={() => {
          if (
            !sections.length &&
            (collectedNodesSwr.isLoading || commonNodesSwr.isLoading)
          ) {
            return (
              <View className="flex flex-row items-center justify-center py-4">
                <Loader />
              </View>
            )
          }
          return null
        }}
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
            tintColor={theme.colors.primary}
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
