import { useCallback, useMemo, useRef } from 'react'
import { Keyboard, SectionList, StyleSheet, Text, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useNavigation } from 'expo-router'
import { useFocusEffect } from 'expo-router/react-navigation'

import Loader from '@/components/Loader'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import MyRefreshControl from '@/components/MyRefreshControl'
import SearchInput from '@/components/SearchInput'

import { useTheme } from '@/containers/ThemeService'
import { useCollectedNodesQuery } from '@/hooks'
import { useAuthStatus } from '@/stores/auth'
import { useCachedState } from '@/utils/hooks'
import { isRefreshing } from '@/utils/react-query'
import { getNodeGroups } from '@/utils/v2ex-client'

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

  const normalizedFilter = filter.trim().toLowerCase()
  const isFiltering = !!normalizedFilter

  const sections = useMemo(() => {
    // Plain substring match rather than a RegExp built from the raw input:
    // typing a bare `(`, `[` or `*` made `new RegExp` throw during render.
    const matchesFilter = (node: { name: string; title: string }) =>
      node.name.toLowerCase().includes(normalizedFilter) ||
      node.title.toLowerCase().includes(normalizedFilter)

    return [
      // The followed nodes are a card grid that the filter never applied to,
      // so while filtering it sat above the results showing unrelated nodes.
      // Drop it for the duration of the filter.
      !isFiltering && hasAuthed && collectedNodesQuery.data?.data
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
        data: isFiltering ? group.nodes.filter(matchesFilter) : group.nodes,
      })),
    ]
      .flat()
      .filter((section) => !!section && !!section.data.length)
  }, [
    commonNodesQuery.data,
    collectedNodesQuery.data,
    hasAuthed,
    normalizedFilter,
    isFiltering,
  ])

  const renderItem = useCallback(({ item }) => {
    switch (item.type) {
      case 'favorite':
        return <CollectedNodes data={item.nodes} />
      default:
        return <PubliicNodeItem data={item} />
    }
  }, [])

  // The favourite row is a single grid item with no `name`, which left its key
  // undefined and fell back to the list index.
  const keyExtractor = useCallback(
    (item) => (item.type === 'favorite' ? 'favorite' : item.name),
    [],
  )

  const renderSectionHeader = useCallback(
    ({ section }) => {
      return (
        <View>
          <MaxWidthWrapper>
            <View style={nodesScreenStyles.margin}>
              <View
                style={[
                  nodesScreenStyles.headerRow,
                  styles.layer1,
                  styles.border_b,
                ]}
              >
                <View style={nodesScreenStyles.titleWrap}>
                  <Text style={[nodesScreenStyles.titleText, styles.text]}>
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
        <View style={nodesScreenStyles.loaderWrap}>
          <Loader />
        </View>
      )
    }
    // Without this, filtering to no matches left a blank screen with no
    // indication that the filter was the reason.
    if (isFiltering && !sections.length) {
      return (
        <View style={nodesScreenStyles.emptyWrap}>
          <Text style={[styles.text_meta, styles.text_sm]}>
            没有匹配「{filter.trim()}」的节点
          </Text>
        </View>
      )
    }
    return null
  }, [
    sections.length,
    collectedNodesQuery.isLoading,
    commonNodesQuery.isLoading,
    isFiltering,
    filter,
    styles.text_meta,
    styles.text_sm,
  ])

  const handleRefresh = useCallback(() => {
    if (hasAuthed) {
      collectedNodesQuery?.refetch()
    }
    commonNodesQuery?.refetch()
  }, [hasAuthed, collectedNodesQuery, commonNodesQuery])

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
    }, [sections, navigation]),
  )

  return (
    <View style={nodesScreenStyles.container}>
      <View style={[nodesScreenStyles.searchWrap, styles.layer1]}>
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

const nodesScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  margin: {
    marginHorizontal: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  titleWrap: {
    paddingVertical: 8,
  },
  titleText: {
    fontWeight: '500',
  },
  loaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  searchWrap: {
    height: 52,
    marginBottom: 4,
  },
})
