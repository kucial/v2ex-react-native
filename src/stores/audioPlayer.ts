import { create } from 'zustand'

import { audioService } from '@/lib/AudioService'
import { AudioItem, useAudioStore } from '@/stores/audio'

interface AudioPlayerState {
  currentAudio: AudioItem | null
  history: AudioItem[]
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
  seekTo: (seconds: number) => Promise<void>
  clearCurrentAudio: () => void
}

export const useAudioPlayerStore = create<AudioPlayerState>((set, get) => {
  // Mount the background listener to `audioService` to bind global metadata state to this Zustand store
  audioService.subscribe((state) => {
    const track = state.queue[state.currentIndex]
    const currentAudio = track
      ? {
          title: track.title,
          url: track.url,
          artist: track.artist,
        }
      : null

    set((prev) => ({
      ...prev,
      currentAudio,
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
    history: [],
    isPlaying: false,
    isLoading: false,
    status: {
      currentTime: 0,
      duration: 0,
      isLoaded: false,
      isBuffering: false,
    },

    playAudio: async (item: AudioItem) => {
      set({ isLoading: true })

      // Update local ephemeral history
      const prevHistory = get().history
      const nextHistory = [
        item,
        ...prevHistory.filter((entry) => entry.url !== item.url),
      ].slice(0, 10)
      set({ history: nextHistory })

      const { currentAudio } = get()

      if (currentAudio?.url !== item.url) {
        const historyItem = useAudioStore.getState().history[item.url]

        await audioService.loadQueue(
          [
            {
              id: item.url,
              url: item.url,
              title: item.title,
              artist: item.artist || '',
            },
          ],
          0,
        )

        if (historyItem && historyItem.lastPosition > 0) {
          // Only seek if we have at least 2 seconds left
          audioService.seekTo(historyItem.lastPosition)
        }
      } else {
        audioService.player.play()
      }

      set({ isLoading: false })
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
