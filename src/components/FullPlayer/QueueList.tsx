import { useEffect, useRef } from 'react'
import { FlashList, FlashListRef } from '@shopify/flash-list'

import { AudioRow } from '@/components/AudioRow'

import { AudioItem } from '@/stores/audio'
import { useAudioPlayerStore } from '@/stores/audioPlayer'

import EmptyHint from './EmptyHint'

export default function QueueList() {
  const queue = useAudioPlayerStore((s) => s.queue)
  const currentIndex = useAudioPlayerStore((s) => s.currentIndex)
  const playQueueIndex = useAudioPlayerStore((s) => s.playQueueIndex)
  const listRef = useRef<FlashListRef<AudioItem>>(null)

  // Bring the playing track into view when the queue is first shown or the
  // track changes underneath us (auto-advance, lock-screen skip).
  useEffect(() => {
    if (currentIndex < 0 || currentIndex >= queue.length) return
    listRef.current?.scrollToIndex({
      index: currentIndex,
      animated: false,
      viewPosition: 0.3,
    })
  }, [currentIndex, queue.length])

  return (
    <FlashList
      ref={listRef}
      data={queue}
      extraData={currentIndex}
      renderItem={({ item, index }) => (
        <AudioRow
          item={item}
          active={index === currentIndex}
          onPress={() => playQueueIndex(index)}
        />
      )}
      keyExtractor={(item, index) => `${index}-${item.url}`}
      maintainVisibleContentPosition={{ disabled: true }}
      ListEmptyComponent={<EmptyHint text='播放列表为空' />}
    />
  )
}
