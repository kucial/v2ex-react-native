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
      shouldAutoPlayRef.current = false
      setIsLoading(true)
      try {
        player.play()
      } catch (error) {
        console.error('Audio play error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    playAfterSourceChange()
  }, [currentAudio?.url, player])

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
      player.pause()
      player.setActiveForLockScreen(false)
      player.clearLockScreenControls()
    } catch (error) {
      console.error('Audio clear error:', error)
    }
    setCurrentAudio(null)
    setIsLoading(false)
    shouldAutoPlayRef.current = false
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
