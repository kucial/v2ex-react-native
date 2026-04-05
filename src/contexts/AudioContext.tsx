import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { audioService } from '@/lib/AudioService'
import { useAudioStore } from '@/stores/audio'

interface AudioItem {
  title: string
  url: string
  artist?: string
}

interface AudioContextType {
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

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export const useAudioContext = () => {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error('useAudioContext must be used within an AudioProvider')
  }
  return context
}

interface AudioProviderProps {
  children: ReactNode
}

export const AudioProvider = ({ children }: AudioProviderProps) => {
  const [playerState, setPlayerState] = useState(audioService.state)
  const [history, setHistory] = useState<AudioItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const lastSaveTimeRef = useRef(0)

  useEffect(() => {
    return audioService.subscribe((state) => {
      setPlayerState(state)
    })
  }, [])

  const currentAudio = useMemo(() => {
    const track = playerState.queue[playerState.currentIndex]
    return track
      ? {
          title: track.title,
          url: track.url,
          artist: track.artist,
        }
      : null
  }, [playerState.queue, playerState.currentIndex])

  const syncHistory = (item: AudioItem) => {
    setHistory((prev) => {
      const next = [item, ...prev.filter((entry) => entry.url !== item.url)]
      return next.slice(0, 10)
    })
  }

  // Save history periodically
  useEffect(() => {
    if (!currentAudio || playerState.duration <= 0) return

    const now = Date.now()
    if (now - lastSaveTimeRef.current > 5000) {
      useAudioStore
        .getState()
        .updateHistory(currentAudio, playerState.position, playerState.duration)
      lastSaveTimeRef.current = now
    }
  }, [currentAudio, playerState.position, playerState.duration])

  // Save history when paused
  useEffect(() => {
    if (!playerState.playing && currentAudio && playerState.duration > 0) {
      useAudioStore
        .getState()
        .updateHistory(currentAudio, playerState.position, playerState.duration)
      lastSaveTimeRef.current = Date.now()
    }
  }, [
    playerState.playing,
    currentAudio,
    playerState.duration,
    playerState.position,
  ])

  const playAudio = async (item: AudioItem) => {
    setIsLoading(true)
    syncHistory(item)

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

    setIsLoading(false)
  }

  const pauseAudio = async () => {
    if (currentAudio && playerState.duration > 0) {
      useAudioStore
        .getState()
        .updateHistory(currentAudio, playerState.position, playerState.duration)
    }
    audioService.player.pause()
  }

  const togglePlayPause = async () => {
    if (!currentAudio) return
    if (playerState.playing) {
      await pauseAudio()
    } else {
      await playAudio(currentAudio)
    }
  }

  const seekTo = async (seconds: number) => {
    audioService.seekTo(seconds)
  }

  const clearCurrentAudio = () => {
    if (currentAudio && playerState.duration > 0) {
      useAudioStore
        .getState()
        .updateHistory(currentAudio, playerState.position, playerState.duration)
    }
    audioService.clearQueue()
  }

  const value: AudioContextType = {
    currentAudio,
    history,
    isPlaying: playerState.playing,
    isLoading,
    status: {
      currentTime: playerState.position,
      duration: playerState.duration,
      isLoaded: playerState.duration > 0,
      isBuffering: playerState.buffering,
    },
    playAudio,
    pauseAudio,
    togglePlayPause,
    seekTo,
    clearCurrentAudio,
  }

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}
