import { useEffect, useRef } from 'react'

import { useAudioStore } from '@/stores/audio'
import { useAudioPlayerStore } from '@/stores/audioPlayer'

export default function AudioWatcher() {
  const lastSaveTimeRef = useRef(0)

  const currentAudio = useAudioPlayerStore((state) => state.currentAudio)
  const isPlaying = useAudioPlayerStore((state) => state.isPlaying)
  const status = useAudioPlayerStore((state) => state.status)

  // Save history periodically
  useEffect(() => {
    if (!currentAudio || status.duration <= 0) return

    const now = Date.now()
    if (now - lastSaveTimeRef.current > 5000) {
      useAudioStore
        .getState()
        .updateHistory(currentAudio, status.currentTime, status.duration)
      lastSaveTimeRef.current = now
    }
  }, [currentAudio, status.currentTime, status.duration])

  // Save history when paused
  useEffect(() => {
    if (!isPlaying && currentAudio && status.duration > 0) {
      useAudioStore
        .getState()
        .updateHistory(currentAudio, status.currentTime, status.duration)
      lastSaveTimeRef.current = Date.now()
    }
  }, [isPlaying, currentAudio, status.duration, status.currentTime])

  return null
}
