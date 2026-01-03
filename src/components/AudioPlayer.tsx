import { Pressable, Text, View } from 'react-native'
import { PauseIcon, PlayIcon } from 'react-native-heroicons/outline'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'

import { useTheme } from '@/containers/ThemeService'
import { useAudioContext } from '@/contexts/AudioContext'

interface AudioPlayerProps {
  audioUrl: string
}

export default function AudioPlayerComponent({ audioUrl }: AudioPlayerProps) {
  const { styles, theme } = useTheme()
  const {
    currentAudioUrl,
    isPlaying,
    isLoading,
    status,
    playAudio,
    pauseAudio,
  } = useAudioContext()

  // Local player for duration info
  const localPlayer = useAudioPlayer(audioUrl)
  const localStatus = useAudioPlayerStatus(localPlayer)

  const isCurrentAudio = currentAudioUrl === audioUrl

  const handlePress = () => {
    if (isCurrentAudio) {
      if (isPlaying) {
        pauseAudio()
      } else {
        playAudio(audioUrl)
      }
    } else {
      playAudio(audioUrl)
    }
  }

  const showPlayIcon = !isCurrentAudio || !isPlaying

  // Use local status for duration info, context status for current playback position
  const progress =
    localStatus.duration > 0 ? status.currentTime / localStatus.duration : 0

  return (
    <View
      className='flex-row items-center p-2 rounded-lg '
      style={styles.layer2}
    >
      <Pressable
        className='w-8 h-8 items-center justify-center active:opacity-50'
        hitSlop={8}
        onPress={handlePress}
      >
        {showPlayIcon ? (
          <PlayIcon size={20} color={theme.colors.text} />
        ) : (
          <PauseIcon size={20} color={theme.colors.text} />
        )}
      </Pressable>
      <View className='ml-2 flex-1'>
        <View className='flex-1 flex-row items-center gap-1'>
          <Text className='text-caption-2 px-1' style={styles.text_meta}>
            {formatTime(isCurrentAudio ? status.currentTime : 0)}
          </Text>

          <View className='flex-1 h-6 justify-center'>
            <View className='h-1 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden'>
              {!!isCurrentAudio && (
                <View
                  className='h-1 rounded-full'
                  style={[
                    {
                      width: `${progress * 100}%`,
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
              )}
            </View>
          </View>

          <Text className='text-caption-2 px-1' style={styles.text_meta}>
            {formatTime(localStatus.duration)}
          </Text>
        </View>
      </View>
    </View>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
