import { Pressable, Text, View } from 'react-native'
import { PlayIcon } from 'react-native-heroicons/outline'

import { useTheme } from '@/containers/ThemeService'
import { useAudioContext } from '@/contexts/AudioContext'
import { AudioItem } from '@/stores/audio'

export function AudioRow({ item }: { item: AudioItem }) {
  const { styles, theme } = useTheme()
  const { playAudio, currentAudio, isPlaying, pauseAudio } = useAudioContext()

  const isActive = currentAudio?.url === item.url

  return (
    <Pressable
      className='flex-row items-center px-4 py-3 active:opacity-60'
      style={[styles.layer1, styles.border_b_light]}
      onPress={() => {
        if (isActive && isPlaying) {
          pauseAudio()
        } else {
          playAudio(item)
        }
      }}
    >
      <View className='w-10 h-10 rounded-full items-center justify-center mr-3 bg-neutral-100 dark:bg-neutral-800'>
        <PlayIcon
          size={20}
          color={isActive ? theme.colors.primary : theme.colors.text}
        />
      </View>
      <View className='flex-1'>
        <Text
          style={[
            styles.text,
            styles.text_base,
            isActive && { color: theme.colors.primary },
          ]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        {!!item.artist && (
          <Text style={[styles.text_meta, styles.text_xs]} numberOfLines={1}>
            {item.artist}
          </Text>
        )}
      </View>
    </Pressable>
  )
}
