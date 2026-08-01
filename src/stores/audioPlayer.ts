import { create } from 'zustand'

import { audioService, Track } from '@/lib/AudioService'
import { track as trackEvent } from '@/lib/tracking'
import { AudioItem, selectSortedResources, useAudioStore } from '@/stores/audio'

interface AudioPlayerState {
  currentAudio: AudioItem | null
  queue: AudioItem[]
  currentIndex: number
  hasNext: boolean
  hasPrev: boolean
  isPlaying: boolean
  isLoading: boolean
  status: {
    currentTime: number
    duration: number
    isLoaded: boolean
    isBuffering: boolean
  }
  playAudio: (item: AudioItem) => Promise<void>
  pauseAudio: () => Promise<void>
  togglePlayPause: () => Promise<void>
  playNext: () => void
  playPrev: () => void
  playQueueIndex: (index: number) => void
  seekTo: (seconds: number) => Promise<void>
  clearCurrentAudio: () => void
}

function toTrack(item: AudioItem): Track {
  return {
    id: item.url,
    url: item.url,
    title: item.title,
    artist: item.artist || '',
    // Carrying artwork through is what gives the lock-screen Now Playing
    // widget its image.
    artworkUrl: item.artworkUrl,
  }
}

function toAudioItem(track: Track): AudioItem {
  return {
    title: track.title,
    url: track.url,
    artist: track.artist,
    artworkUrl: track.artworkUrl,
  }
}

export const useAudioPlayerStore = create<AudioPlayerState>((set, get) => {
  // Mount the background listener to `audioService` to bind global metadata state to this Zustand store
  audioService.subscribe((state) => {
    const track = state.queue[state.currentIndex]

    set((prev) => ({
      ...prev,
      currentAudio: track ? toAudioItem(track) : null,
      queue: state.queue.map(toAudioItem),
      currentIndex: state.currentIndex,
      hasNext: audioService.hasNext,
      hasPrev: audioService.hasPrev,
      isPlaying: state.playing,
      status: {
        currentTime: state.position,
        duration: state.duration,
        isLoaded: state.duration > 0,
        isBuffering: state.buffering,
      },
    }))
  })

  return {
    currentAudio: null,
    queue: [],
    currentIndex: -1,
    hasNext: false,
    hasPrev: false,
    isPlaying: false,
    isLoading: false,
    status: {
      currentTime: 0,
      duration: 0,
      isLoaded: false,
      isBuffering: false,
    },

    playAudio: async (item: AudioItem) => {
      const { currentAudio } = get()

      if (currentAudio?.url === item.url) {
        audioService.player.play()
        return
      }

      set({ isLoading: true })
      trackEvent('audio.play')

      try {
        // The queue is always the full discovered-resources list, so next/prev
        // walk the library. An item that isn't a known resource yet (e.g. a
        // freshly rendered feed card) is played at the head of that list.
        const resources = selectSortedResources(useAudioStore.getState())
        const foundIndex = resources.findIndex((e) => e.url === item.url)
        const items: AudioItem[] =
          foundIndex >= 0 ? resources : [item, ...resources]
        const startIndex = foundIndex >= 0 ? foundIndex : 0

        const historyItem = useAudioStore.getState().history[item.url]

        await audioService.loadQueue(items.map(toTrack), startIndex)

        if (historyItem && historyItem.lastPosition > 0) {
          audioService.seekTo(historyItem.lastPosition)
        }
      } finally {
        set({ isLoading: false })
      }
    },

    pauseAudio: async () => {
      const { currentAudio, status } = get()
      if (currentAudio && status.duration > 0) {
        useAudioStore
          .getState()
          .updateHistory(currentAudio, status.currentTime, status.duration)
      }
      audioService.player.pause()
    },

    togglePlayPause: async () => {
      const { currentAudio, isPlaying, pauseAudio, playAudio } = get()
      if (!currentAudio) return
      if (isPlaying) {
        await pauseAudio()
      } else {
        await playAudio(currentAudio)
      }
    },

    playNext: () => {
      trackEvent('audio.skip', { direction: 'next' })
      audioService.next()
    },

    playPrev: () => {
      trackEvent('audio.skip', { direction: 'prev' })
      audioService.prev()
    },

    playQueueIndex: (index: number) => {
      const { currentIndex, isPlaying } = get()
      if (index === currentIndex) {
        // Tapping the active row toggles it, matching AudioRow's behaviour.
        if (isPlaying) {
          get().pauseAudio()
        } else {
          audioService.player.play()
        }
        return
      }
      audioService.playAt(index)
    },

    seekTo: async (seconds: number) => {
      audioService.seekTo(seconds)
    },

    clearCurrentAudio: () => {
      const { currentAudio, status } = get()
      if (currentAudio && status.duration > 0) {
        useAudioStore
          .getState()
          .updateHistory(currentAudio, status.currentTime, status.duration)
      }
      audioService.clearQueue()
    },
  }
})
