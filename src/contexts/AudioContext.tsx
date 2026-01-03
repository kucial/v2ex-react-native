import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'

interface AudioContextType {
  currentAudioUrl: string | null
  isPlaying: boolean
  isLoading: boolean
  status: {
    currentTime: number
    duration: number
    isLoaded: boolean
    isBuffering: boolean
  }
  playAudio: (url: string) => Promise<void>
  pauseAudio: () => Promise<void>
  togglePlayPause: () => Promise<void>
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
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const player = useAudioPlayer(currentAudioUrl || '')
  const status = useAudioPlayerStatus(player)

  useEffect(() => {
    const handlePlayback = async () => {
      if (!currentAudioUrl) return

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
  }, [isPlaying, currentAudioUrl, player])

  const playAudio = async (url: string) => {
    if (currentAudioUrl !== url) {
      setCurrentAudioUrl(url)
      setIsPlaying(true)
    } else {
      setIsPlaying(true)
    }
  }

  const pauseAudio = async () => {
    setIsPlaying(false)
  }

  const togglePlayPause = async () => {
    if (currentAudioUrl) {
      setIsPlaying(!isPlaying)
    }
  }

  const clearCurrentAudio = () => {
    setCurrentAudioUrl(null)
    setIsPlaying(false)
    setIsLoading(false)
  }

  const value: AudioContextType = {
    currentAudioUrl,
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
    clearCurrentAudio,
  }

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}
