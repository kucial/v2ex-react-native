import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'

interface AudioItem {
  title: string
  url: string
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
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const player = useAudioPlayer(currentAudio?.url || '')
  const status = useAudioPlayerStatus(player)

  useEffect(() => {
    const handlePlayback = async () => {
      if (!currentAudio?.url) return

      if (isPlaying) {
        setIsLoading(true)
        try {
          await player.play()
        } catch (error) {
          console.error('Audio play error:', error)
          setIsPlaying(false)
        } finally {
          setIsLoading(false)
        }
      } else {
        await player.pause()
      }
    }

    handlePlayback()
  }, [isPlaying, currentAudio?.url, player])

  const playAudio = async (item: AudioItem) => {
    if (currentAudio?.url !== item.url) {
      setCurrentAudio(item)
      setIsPlaying(true)
    } else {
      setIsPlaying(true)
    }

    setHistory((prev) => {
      const next = [item, ...prev.filter((entry) => entry.url !== item.url)]
      return next.slice(0, 10)
    })
  }

  const pauseAudio = async () => {
    setIsPlaying(false)
  }

  const togglePlayPause = async () => {
    if (currentAudio) {
      setIsPlaying(!isPlaying)
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
    setCurrentAudio(null)
    setIsPlaying(false)
    setIsLoading(false)
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
