import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { FlashList, FlashListRef } from '@shopify/flash-list'

import { AudioRow } from '@/components/AudioRow'
import V2exIcon from '@/components/icons/V2exIcon'

import { useTheme } from '@/containers/ThemeService'
import {
  AudioResourceItem,
  selectSortedResources,
  useAudioStore,
} from '@/stores/audio'
import { useCachedState } from '@/utils/hooks'

import EmptyHint from './EmptyHint'

type SortKey = 'discovered_desc' | 'discovered_asc' | 'title'

const SORT_KEYS: SortKey[] = ['discovered_desc', 'discovered_asc', 'title']
const SORT_LABELS: Record<SortKey, string> = {
  discovered_desc: '最新发现',
  discovered_asc: '最早发现',
  title: '标题',
}

function FilterChip(props: {
  label: string
  active: boolean
  onPress: () => void
}) {
  const { theme, styles } = useTheme()
  return (
    <Pressable
      onPress={props.onPress}
      style={[
        chipStyles.chip,
        props.active
          ? { borderColor: theme.colors.primary }
          : [styles.layer2, chipStyles.chipInactive],
      ]}
    >
      <Text
        style={[
          styles.text_sm,
          {
            color: props.active ? theme.colors.primary : theme.colors.text_desc,
          },
        ]}
        numberOfLines={1}
      >
        {props.label}
      </Text>
    </Pressable>
  )
}

export default function ResourcesList() {
  const resourcesMap = useAudioStore((state) => state.resources)
  const { theme, styles, colorScheme } = useTheme()
  const insets = useSafeAreaInsets()
  const { showActionSheetWithOptions } = useActionSheet()

  const [sortKey, setSortKey] = useCachedState<SortKey>(
    '$app$/audio-resources-sort',
    'discovered_desc',
  )
  const [artistFilter, setArtistFilter] = useState<string | null>(null)
  const listRef = useRef<FlashListRef<AudioResourceItem>>(null)

  // Jump back to the top whenever the ordering/filter changes
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false })
  }, [sortKey, artistFilter])

  const artists = useMemo(() => {
    const values = new Set<string>()
    for (const item of Object.values(resourcesMap)) {
      if (item.artist) {
        values.add(item.artist)
      }
    }
    return [...values].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
  }, [resourcesMap])

  const items = useMemo(() => {
    let list = selectSortedResources({ resources: resourcesMap })
    if (artistFilter) {
      list = list.filter((item) => item.artist === artistFilter)
    }
    switch (sortKey) {
      case 'discovered_asc':
        return [...list].sort((a, b) => a.discoveredAt - b.discoveredAt)
      case 'title':
        return [...list].sort((a, b) =>
          (a.title || '').localeCompare(b.title || '', 'zh-Hans-CN'),
        )
      default:
        return list
    }
  }, [resourcesMap, sortKey, artistFilter])

  const handleSortPress = useCallback(() => {
    showActionSheetWithOptions(
      {
        title: '排序方式',
        options: ['取消', ...SORT_KEYS.map((key) => SORT_LABELS[key])],
        cancelButtonIndex: 0,
        tintColor: styles.text_primary.color as string,
        userInterfaceStyle: colorScheme,
        containerStyle: {
          ...styles.layer1,
          paddingBlock: insets.bottom,
        },
        titleTextStyle: styles.text,
      },
      (buttonIndex) => {
        if (buttonIndex && buttonIndex > 0) {
          setSortKey(SORT_KEYS[buttonIndex - 1])
        }
      },
    )
  }, [
    showActionSheetWithOptions,
    styles,
    colorScheme,
    insets.bottom,
    setSortKey,
  ])

  return (
    <View style={tabStyles.container}>
      <View style={[tabStyles.toolbar, styles.border_b_light]}>
        <Pressable
          onPress={handleSortPress}
          hitSlop={8}
          style={({ pressed }) => [
            tabStyles.sortButton,
            pressed && tabStyles.pressed,
          ]}
        >
          <V2exIcon
            name='arrows-up-down-outline'
            size={16}
            color={theme.colors.text_desc}
          />
          <Text style={[styles.text_meta, styles.text_sm]}>
            {SORT_LABELS[sortKey] || SORT_LABELS.discovered_desc}
          </Text>
          <View style={tabStyles.spacer} />
          <V2exIcon
            name='chevron-down-outline'
            size={14}
            color={theme.colors.text_meta}
          />
        </Pressable>
        {artists.length >= 2 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={tabStyles.chipScroll}
            contentContainerStyle={tabStyles.chipRow}
          >
            <FilterChip
              label='全部'
              active={!artistFilter}
              onPress={() => setArtistFilter(null)}
            />
            {artists.map((artist) => (
              <FilterChip
                key={artist}
                label={artist}
                active={artistFilter === artist}
                onPress={() => setArtistFilter(artist)}
              />
            ))}
          </ScrollView>
        )}
      </View>
      <FlashList
        ref={listRef}
        data={items}
        renderItem={({ item }) => <AudioRow item={item} />}
        keyExtractor={(item) => item.url}
        // chat-style position anchoring leaves the list over-scrolled after
        // a re-sort, showing a single item
        maintainVisibleContentPosition={{ disabled: true }}
        ListEmptyComponent={<EmptyHint text='浏览星球时会自动收集音频资源' />}
      />
    </View>
  )
}

const tabStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Column so the sort trigger can span the full width; the artist chips get
  // their own row underneath instead of competing for horizontal space.
  toolbar: {
    paddingVertical: 4,
    gap: 4,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 4,
    minHeight: 40,
    paddingHorizontal: 16,
  },
  spacer: {
    flex: 1,
  },
  pressed: {
    opacity: 0.6,
  },
  chipScroll: {
    flexGrow: 0,
    paddingHorizontal: 16,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
})

const chipStyles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    maxWidth: 160,
  },
  chipInactive: {
    borderColor: 'transparent',
  },
})
