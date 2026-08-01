import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'

import V2exIcon from '@/components/icons/V2exIcon'

import { useTheme } from '@/containers/ThemeService'
import { useAudioPlayerStore } from '@/stores/audioPlayer'

function ControlButton({
  onPress,
  disabled,
  size,
  children,
  label,
}: {
  onPress: () => void
  disabled?: boolean
  size: number
  children: React.ReactNode
  label: string
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole='button'
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        controlStyles.button,
        { width: size, height: size },
        disabled && controlStyles.disabled,
        pressed && !disabled && controlStyles.pressed,
      ]}
    >
      {children}
    </Pressable>
  )
}

export default function Controls() {
  const { theme } = useTheme()
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying)
  const isLoading = useAudioPlayerStore((s) => s.isLoading)
  const isBuffering = useAudioPlayerStore((s) => s.status.isBuffering)
  const hasNext = useAudioPlayerStore((s) => s.hasNext)
  const hasPrev = useAudioPlayerStore((s) => s.hasPrev)
  const togglePlayPause = useAudioPlayerStore((s) => s.togglePlayPause)
  const playNext = useAudioPlayerStore((s) => s.playNext)
  const playPrev = useAudioPlayerStore((s) => s.playPrev)

  const busy = isLoading || isBuffering

  return (
    <View style={controlStyles.row}>
      <ControlButton
        onPress={playPrev}
        disabled={!hasPrev}
        size={48}
        label='上一首'
      >
        <V2exIcon
          name='backward-solid'
          size={26}
          color={hasPrev ? theme.colors.text : theme.colors.text_meta}
        />
      </ControlButton>

      <ControlButton
        onPress={() => togglePlayPause()}
        size={56}
        label={isPlaying ? '暂停' : '播放'}
      >
        {busy ? (
          <ActivityIndicator size='small' color={theme.colors.text} />
        ) : (
          <V2exIcon
            name={isPlaying ? 'pause-solid' : 'play-solid'}
            size={38}
            color={theme.colors.text}
          />
        )}
      </ControlButton>

      <ControlButton
        onPress={playNext}
        disabled={!hasNext}
        size={48}
        label='下一首'
      >
        <V2exIcon
          name='forward-solid'
          size={26}
          color={hasNext ? theme.colors.text : theme.colors.text_meta}
        />
      </ControlButton>
    </View>
  )
}

const controlStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.3,
  },
})
