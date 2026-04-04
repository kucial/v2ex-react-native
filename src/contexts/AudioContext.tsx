import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio'

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
  const [currentAudio, setCurrentAudio] = useState<AudioItem | null>(null)
  const [history, setHistory] = useState<AudioItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const shouldAutoPlayRef = useRef(false)
  const hasSeekedRef = useRef<string | null>(null)
  const lastSaveTimeRef = useRef(0)

  const player = useAudioPlayer(currentAudio?.url || '')
  const status = useAudioPlayerStatus(player)
  const isPlaying = status.playing

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    })
  }, [])

  useEffect(() => {
    const syncLockScreen = async () => {
      if (!currentAudio) {
        try {
          await player.setActiveForLockScreen(false)
          player.clearLockScreenControls()
        } catch (error) {
          console.error('Audio lock screen clear error:', error)
        }
        return
      }

      try {
        await player.setActiveForLockScreen(true, {
          title: currentAudio.title,
          artist: currentAudio.artist,
        })
      } catch (error) {
        console.error('Audio lock screen update error:', error)
      }
    }

    syncLockScreen()
  }, [currentAudio, player])

  useEffect(() => {
    const playAfterSourceChange = async () => {
      if (!currentAudio?.url || !shouldAutoPlayRef.current) return
      if (!status.isLoaded) return // Wait until loaded to seek/play reliably

      shouldAutoPlayRef.current = false
      setIsLoading(true)
      try {
        // Attempt to resume from last position
        if (hasSeekedRef.current !== currentAudio.url && status.duration > 0) {
          hasSeekedRef.current = currentAudio.url
          const historyItem = useAudioStore.getState().history[currentAudio.url]
          if (historyItem && historyItem.lastPosition > 0) {
            // Only seek if we have at least 2 seconds left
            if (historyItem.lastPosition < status.duration - 2) {
              await player.seekTo(historyItem.lastPosition)
            }
          }
        }
        player.play()
      } catch (error) {
        console.error('Audio play error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    playAfterSourceChange()
  }, [currentAudio?.url, player, status.isLoaded, status.duration])

  // Track progress and save to store periodically
  useEffect(() => {
    if (!currentAudio || !status.isLoaded || status.duration <= 0) return

    const now = Date.now()
    // Save every 5 seconds
    if (now - lastSaveTimeRef.current > 5000) {
      useAudioStore
        .getState()
        .updateHistory(currentAudio, status.currentTime, status.duration)
      lastSaveTimeRef.current = now
    }
  }, [currentAudio, status.currentTime, status.duration, status.isLoaded])

  // Save history accurately when paused
  useEffect(() => {
    if (!isPlaying && currentAudio && status.isLoaded && status.duration > 0) {
      useAudioStore
        .getState()
        .updateHistory(currentAudio, status.currentTime, status.duration)
      lastSaveTimeRef.current = Date.now()
    }
  }, [
    isPlaying,
    currentAudio,
    status.isLoaded,
    status.duration,
    status.currentTime,
  ])

  const playAudio = async (item: AudioItem) => {
    if (currentAudio?.url !== item.url) {
      shouldAutoPlayRef.current = true
      setCurrentAudio(item)
    } else {
      try {
        setIsLoading(true)
        player.play()
      } catch (error) {
        console.error('Audio play error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    setHistory((prev) => {
      const next = [item, ...prev.filter((entry) => entry.url !== item.url)]
      return next.slice(0, 10)
    })
  }

  const pauseAudio = async () => {
    try {
      if (currentAudio && status.isLoaded && status.duration > 0) {
        useAudioStore
          .getState()
          .updateHistory(currentAudio, status.currentTime, status.duration)
      }
      player.pause()
    } catch (error) {
      console.error('Audio pause error:', error)
    }
  }

  const togglePlayPause = async () => {
    if (!currentAudio) return
    if (status.playing) {
      await pauseAudio()
    } else {
      await playAudio(currentAudio)
    }
  }

  const seekTo = async (seconds: number) => {
    if (!currentAudio) return
    try {
      await player.seekTo(seconds)
    } catch (error) {
      console.error('Audio seek error:', error)
    }
  }

  const clearCurrentAudio = () => {
    try {
      if (currentAudio && status.isLoaded && status.duration > 0) {
        useAudioStore
          .getState()
          .updateHistory(currentAudio, status.currentTime, status.duration)
      }
      player.pause()
      player.setActiveForLockScreen(false)
      player.clearLockScreenControls()
    } catch (error) {
      console.error('Audio clear error:', error)
    }
    setCurrentAudio(null)
    setIsLoading(false)
    shouldAutoPlayRef.current = false
    hasSeekedRef.current = null
  }

  const value: AudioContextType = {
    currentAudio,
    history,
    isPlaying,
    isLoading,
    status: {
      currentTime: status.currentTime,
      duration: status.duration,
      isLoaded: status.isLoaded,
      isBuffering: status.isBuffering,
    },
    playAudio,
    pauseAudio,
    togglePlayPause,
    seekTo,
    clearCurrentAudio,
  }

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}
