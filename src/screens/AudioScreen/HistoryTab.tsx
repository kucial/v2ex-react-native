import { useMemo } from 'react'
import { FlashList } from '@shopify/flash-list'

import { useAudioStore } from '@/stores/audio'

import { AudioRow } from './AudioRow'

export function HistoryTab() {
  const historyMap = useAudioStore((state) => state.history)

  const historyList = useMemo(() => {
    return Object.values(historyMap).sort((a, b) => b.updatedAt - a.updatedAt)
  }, [historyMap])

  return (
    <FlashList
      contentContainerClassName='pb-safe'
      data={historyList}
      renderItem={({ item }) => <AudioRow item={item} />}
      keyExtractor={(item) => item.url}
    />
  )
}
