import { memo, useCallback, useMemo, useRef } from 'react'
import { Keyboard, SectionList, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { useNavigation } from 'expo-router'

import Loader from '@/components/Loader'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import MyRefreshControl from '@/components/MyRefreshControl'
import SearchInput from '@/components/SearchInput'

import { useTheme } from '@/containers/ThemeService'
import { useCollectedNodesQuery } from '@/hooks'
import { useAuthStatus } from '@/stores/auth'
import { useCachedState } from '@/utils/hooks'
import { isRefreshing } from '@/utils/react-query'
import { getMyCollectedNodes, getNodeGroups } from '@/utils/v2ex-client'

import CollectedNodes from './CollectedNodes'
import PubliicNodeItem from './PubliicNodeItem'

const CACHE_KEY = '$app$/nodes-filter'
const SECTION_FOOTER_STYLE = { height: 12 }

export default function NodesScreen() {
  const status = useAuthStatus()
  const navigation = useNavigation()

  const { styles } = useTheme()

  const [filter, setFilter] = useCachedState<string>(CACHE_KEY, '')

  const hasAuthed = status === 'authed'
  const collectedNodesQuery = useCollectedNodesQuery(hasAuthed)
  const commonNodesQuery = useQuery({
    queryKey: ['/page/planes/node-groups.json'],
    queryFn: getNodeGroups,
  })

  const filterInput = useRef(null)
  const listRef = useRef<SectionList>(null)

  const sections = useMemo(() => {
    return [
      hasAuthed && collectedNodesQuery.data?.data
        ? {
            title: '收藏的节点',
            data: [
              {
                type: 'favorite',
                nodes: collectedNodesQuery.data.data,
              },
            ],
          }
        : null,
      commonNodesQuery.data?.data.map((group) => ({
        title: group.title,
        data: filter
          ? group.nodes.filter(
              (node) =>
                node.name.match(new RegExp(filter, 'i')) ||
                node.title.match(new RegExp(filter, 'i')),
            )
          : group.nodes,
      })),
    ]
      .flat()
      .filter((section) => !!section && !!section.data.length)
  }, [commonNodesQuery.data, collectedNodesQuery.data, hasAuthed, filter])

  const renderItem = useCallback(({ item }) => {
    switch (item.type) {
      case 'favorite':
        return <CollectedNodes data={item.nodes} />
      default:
        return <PubliicNodeItem data={item} />
    }
  }, [])

  const keyExtractor = useCallback((item) => item.name, [])

  const renderSectionHeader = useCallback(
    ({ section }) => {
      return (
        <View>
          <MaxWidthWrapper>
            <View className='mx-1'>
              <View
                className='flex flex-row justify-between items-center px-3 rounded-t-sm'
                style={[styles.layer1, styles.border_b]}
              >
                <View className='py-2'>
                  <Text className='font-medium' style={styles.text}>
                    {section.title}
                  </Text>
                </View>
              </View>
            </View>
          </MaxWidthWrapper>
        </View>
      )
    },
    [styles.layer1, styles.border_b, styles.text],
  )

  const renderSectionFooter = useCallback(
    () => <View style={SECTION_FOOTER_STYLE}></View>,
    [],
  )

  const listHeader = useMemo(() => {
    if (
      !sections.length &&
      (collectedNodesQuery.isLoading || commonNodesQuery.isLoading)
    ) {
      return (
        <View className='flex flex-row items-center justify-center py-4'>
          <Loader />
        </View>
      )
    }
    return null
  }, [
    sections.length,
    collectedNodesQuery.isLoading,
    commonNodesQuery.isLoading,
  ])

  const handleRefresh = useCallback(() => {
    if (hasAuthed) {
      collectedNodesQuery?.refetch()
    }
    commonNodesQuery?.refetch()
  }, [hasAuthed])

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
    <View className='flex-1'>
      <View className='h-[52px] mb-1' style={styles.layer1}>
        <SearchInput
          placeholder='筛选'
          initialValue={filter}
          ref={filterInput}
          onSubmit={(text) => {
            setFilter(text.trim())
          }}
          onReset={() => {
            setFilter('')
          }}
          onChangeText={setFilter}
        />
      </View>
      <SectionList
        ref={listRef}
        sections={sections}
        ListHeaderComponent={listHeader}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        renderSectionFooter={renderSectionFooter}
        refreshControl={
          <MyRefreshControl
            refreshing={
              isRefreshing(commonNodesQuery) ||
              (hasAuthed && isRefreshing(collectedNodesQuery))
            }
            onRefresh={handleRefresh}
          />
        }
        onScroll={Keyboard.dismiss}
      />
    </View>
  )
}
