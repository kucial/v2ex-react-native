import { useCallback, useMemo, useState } from 'react'
import {
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native'
import { KeyboardStickyView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { useBottomTabBarHeight } from 'expo-router/tabs'

import V2exIcon from '@/components/icons/V2exIcon'

import { isPad } from '@/utils/device'

import GlassSurface from './GlassSurface'
import { pressFeedbackStyles } from './pressFeedback'
import { AIChatColors, useAIChatTheme } from './theme'

/**
 * Distance between the bottom of the window and the bottom of the chat surface
 * — the tab bar on phones, the safe area on a pad. The composer subtracts it
 * from the keyboard height when it lifts, and the message list has to use the
 * exact same number for `KeyboardChatScrollView`'s `offset`, or the two lift by
 * different amounts and the layout jumps every time the keyboard opens.
 */
export function useComposerKeyboardOffset() {
  const { width, height: windowHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const tabBarHeight = useBottomTabBarHeight()
  const isPadPortrait = isPad && width <= windowHeight

  if (!isPad) return tabBarHeight
  return isPadPortrait ? 80 : insets.bottom - 8
}

type Props = {
  isGenerating: boolean
  onSend: (text: string) => boolean
  onStop: () => void
  onHeightChange: (height: number) => void
}

export default function Composer({
  isGenerating,
  onSend,
  onStop,
  onHeightChange,
}: Props) {
  const { colors } = useAIChatTheme()
  const styles = useMemo(() => createStyles(colors), [colors])
  const [value, setValue] = useState('')
  const canSend = value.trim().length > 0
  const { width, height: windowHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const keyboardOffset = useComposerKeyboardOffset()
  const isPadLandscape = isPad && width > windowHeight

  const submit = useCallback(async () => {
    if (!canSend || isGenerating) return
    const text = value
    if (!onSend(text)) return
    setValue('')
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
  }, [canSend, isGenerating, onSend, value])

  return (
    <KeyboardStickyView
      offset={{ opened: keyboardOffset }}
      style={styles.sticky}
    >
      <View
        style={[
          styles.outer,
          { paddingBottom: isPadLandscape ? insets.bottom : 8 },
        ]}
        onLayout={(event) => onHeightChange(event.nativeEvent.layout.height)}
      >
        <GlassSurface style={styles.surface} tintColor={colors.composerGlass}>
          <View style={styles.row}>
            <TextInput
              accessibilityLabel='消息'
              multiline
              placeholder='输入消息'
              placeholderTextColor={colors.tertiaryText}
              value={value}
              onChangeText={setValue}
              style={styles.input}
              maxLength={12000}
            />
            <Pressable
              accessibilityLabel={isGenerating ? '停止生成' : '发送消息'}
              accessibilityRole='button'
              accessibilityState={{
                disabled: !isGenerating && !canSend,
              }}
              disabled={!isGenerating && !canSend}
              onPress={isGenerating ? onStop : submit}
              style={({ pressed }) => [
                styles.send,
                !isGenerating && !canSend && styles.sendDisabled,
                pressed && pressFeedbackStyles.compact,
              ]}
            >
              <V2exIcon
                name={isGenerating ? 'stop-solid' : 'arrow-up-outline'}
                size={isGenerating ? 12 : 17}
                color={colors.accentText}
              />
            </Pressable>
          </View>
        </GlassSurface>
      </View>
    </KeyboardStickyView>
  )
}

function createStyles(colors: AIChatColors) {
  return StyleSheet.create({
    sticky: { position: 'absolute', left: 0, right: 0, bottom: 0 },
    outer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 10,
      paddingTop: 8,
    },
    surface: {
      flex: 1,
      minHeight: 44,
      maxHeight: 176,
      borderRadius: 23,
      overflow: 'hidden',
      paddingHorizontal: 5,
      paddingVertical: 4,
    },
    row: { minHeight: 36, flexDirection: 'row', alignItems: 'flex-end' },
    input: {
      flex: 1,
      minHeight: 36,
      maxHeight: 116,
      paddingHorizontal: 10,
      paddingTop: 8,
      paddingBottom: 7,
      color: colors.text,
      fontSize: 16,
      lineHeight: 21,
    },
    send: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      margin: 2,
      backgroundColor: colors.accent,
    },
    sendDisabled: { opacity: 0.28 },
  })
}
