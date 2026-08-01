import { useMemo } from 'react'
import { FlashList } from '@shopify/flash-list'

import { AudioRow } from '@/components/AudioRow'

import { useAudioStore } from '@/stores/audio'

import EmptyHint from './EmptyHint'

export default function HistoryList() {
  const historyMap = useAudioStore((state) => state.history)

  const historyList = useMemo(() => {
    return Object.values(historyMap).sort((a, b) => b.updatedAt - a.updatedAt)
  }, [historyMap])

  return (
    <FlashList
      data={historyList}
      renderItem={({ item }) => <AudioRow item={item} />}
      keyExtractor={(item) => item.url}
      ListEmptyComponent={<EmptyHint text='还没有播放记录' />}
    />
  )
}
