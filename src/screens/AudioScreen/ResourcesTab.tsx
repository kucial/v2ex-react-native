import { useMemo } from 'react'
import { FlashList } from '@shopify/flash-list'

import { useAudioStore } from '@/stores/audio'

import { AudioRow } from './AudioRow'

export function ResourcesTab() {
  const resourcesMap = useAudioStore((state) => state.resources)

  const sortedResources = useMemo(() => {
    return Object.values(resourcesMap).sort(
      (a, b) => b.discoveredAt - a.discoveredAt,
    )
  }, [resourcesMap])

  return (
    <FlashList
      contentContainerClassName='pb-safe'
      data={sortedResources}
      renderItem={({ item }) => <AudioRow item={item} />}
      keyExtractor={(item) => item.url}
    />
  )
}
