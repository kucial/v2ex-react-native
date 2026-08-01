import { Pressable, StyleSheet, View } from 'react-native'

import AudioScrubber from '@/components/AudioScrubber'
import V2exIcon from '@/components/icons/V2exIcon'

import { useTheme } from '@/containers/ThemeService'
import { useAudioPlayerStore } from '@/stores/audioPlayer'

interface AudioPlayerProps {
  audio: {
    title: string
    url: string
    artist?: string
  }
}

export default function AudioPlayerComponent({ audio }: AudioPlayerProps) {
  const { styles, theme } = useTheme()
  const currentAudio = useAudioPlayerStore((s) => s.currentAudio)
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying)
  const status = useAudioPlayerStore((s) => s.status)
  const playAudio = useAudioPlayerStore((s) => s.playAudio)
  const pauseAudio = useAudioPlayerStore((s) => s.pauseAudio)
  const seekTo = useAudioPlayerStore((s) => s.seekTo)

  const isCurrentAudio = currentAudio?.url === audio.url

  const handlePress = () => {
    if (isCurrentAudio && isPlaying) {
      pauseAudio()
    } else {
      playAudio(audio)
    }
  }

  const showPlayIcon = !isCurrentAudio || !isPlaying

  return (
    <View style={[audioStyles.container, styles.layer2]}>
      <Pressable
        style={({ pressed }) => [
          audioStyles.playBtn,
          pressed && audioStyles.pressed,
        ]}
        hitSlop={8}
        onPress={handlePress}
        accessibilityLabel={showPlayIcon ? 'Play audio' : 'Pause audio'}
        accessibilityRole='button'
        accessibilityState={{ disabled: false }}
      >
        {showPlayIcon ? (
          <V2exIcon name='play-outline' size={20} color={theme.colors.text} />
        ) : (
          <V2exIcon name='pause-outline' size={20} color={theme.colors.text} />
        )}
      </Pressable>
      <View style={audioStyles.contentWrap}>
        <AudioScrubber
          isActive={isCurrentAudio}
          currentTime={status.currentTime}
          duration={status.duration}
          onSeek={seekTo}
          size='compact'
        />
      </View>
    </View>
  )
}

const audioStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  playBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
  contentWrap: {
    marginLeft: 8,
    flex: 1,
    flexDirection: 'row',
  },
})
