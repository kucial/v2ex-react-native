import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'

import V2exIcon from '@/components/icons/V2exIcon'

import { useTheme } from '@/containers/ThemeService'
import { AudioItem } from '@/stores/audio'
import { useAudioPlayerStore } from '@/stores/audioPlayer'

export function AudioRow({ item }: { item: AudioItem }) {
  const { styles, theme } = useTheme()
  const playAudio = useAudioPlayerStore((s) => s.playAudio)
  const pauseAudio = useAudioPlayerStore((s) => s.pauseAudio)
  const currentAudio = useAudioPlayerStore((s) => s.currentAudio)
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying)

  const isActive = currentAudio?.url === item.url

  return (
    <Pressable
      style={({ pressed }) => [
        audioRowStyles.row,
        styles.layer1,
        styles.border_b_light,
        pressed && audioRowStyles.pressed,
      ]}
      onPress={() => {
        if (isActive && isPlaying) {
          pauseAudio()
        } else {
          playAudio(item)
        }
      }}
    >
      <View
        style={[
          audioRowStyles.iconWrap,
          { backgroundColor: theme.colors.overlay_input_bg },
        ]}
      >
        {item.artworkUrl ? (
          <Image source={item.artworkUrl} style={audioRowStyles.artworkImage} />
        ) : (
          <V2exIcon
            name='play-outline'
            size={20}
            color={isActive ? theme.colors.primary : theme.colors.text}
          />
        )}
      </View>
      <View style={audioRowStyles.flex1}>
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

const audioRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pressed: {
    opacity: 0.6,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  flex1: {
    flex: 1,
  },
  artworkImage: {
    width: 20,
    height: 20,
  },
})
