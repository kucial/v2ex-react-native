import { useMemo } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import V2exIcon from '@/components/icons/V2exIcon'

import { isPad } from '@/utils/device'

import GlassSurface from './GlassSurface'
import { pressFeedbackStyles } from './pressFeedback'
import { AIChatColors, useAIChatTheme } from './theme'

export type TokenPromptStatus = 'loading' | 'missing' | 'invalid'

type Props = {
  status: TokenPromptStatus
  onManageToken: () => void
  onHeightChange: (height: number) => void
}

function copyFor(status: TokenPromptStatus): {
  notice: string
  action?: string
  danger: boolean
} {
  switch (status) {
    case 'loading':
      return { notice: '正在读取 Token…', danger: false }
    case 'invalid':
      return {
        notice: 'Token 无效或已失效',
        action: '重新设置 Token',
        danger: true,
      }
    default:
      return {
        notice: '需要 V2EX Token 才能开始聊天',
        action: '设置 Token',
        danger: false,
      }
  }
}

/**
 * Stands in for the composer while chatting is not possible.
 *
 * Showing an input the user cannot send from invites them to type a message
 * and lose it. This occupies the same anchored slot and reports its height the
 * same way, so the message list keeps its bottom inset across the swap.
 */
export default function TokenSetupPrompt({
  status,
  onManageToken,
  onHeightChange,
}: Props) {
  const { colors } = useAIChatTheme()
  const styles = useMemo(() => createStyles(colors), [colors])
  const insets = useSafeAreaInsets()
  const { width, height: windowHeight } = useWindowDimensions()
  const isPadLandscape = isPad && width > windowHeight
  const { notice, action, danger } = copyFor(status)
  const interactive = Boolean(action)

  return (
    <View style={styles.sticky}>
      <View
        style={[
          styles.outer,
          { paddingBottom: isPadLandscape ? insets.bottom : 8 },
        ]}
        onLayout={(event) => onHeightChange(event.nativeEvent.layout.height)}
      >
        <Pressable
          accessibilityLabel={action ?? notice}
          accessibilityRole={interactive ? 'button' : 'text'}
          accessibilityState={{ disabled: !interactive }}
          disabled={!interactive}
          onPress={onManageToken}
          style={({ pressed }) => [
            styles.pressable,
            pressed && pressFeedbackStyles.regular,
          ]}
        >
          <GlassSurface style={styles.surface} tintColor={colors.composerGlass}>
            <View style={styles.row}>
              {status === 'loading' ? (
                <ActivityIndicator
                  size='small'
                  color={colors.secondaryText}
                  style={styles.leading}
                />
              ) : (
                <View
                  style={[
                    styles.leading,
                    styles.badge,
                    {
                      backgroundColor: danger
                        ? colors.dangerBackground
                        : colors.elevated,
                    },
                  ]}
                >
                  <V2exIcon
                    name='key-outline'
                    size={15}
                    color={danger ? colors.dangerText : colors.text}
                  />
                </View>
              )}

              <View style={styles.text}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.notice,
                    { color: danger ? colors.dangerText : colors.text },
                  ]}
                >
                  {notice}
                </Text>
                {action ? (
                  <Text numberOfLines={1} style={styles.action}>
                    {action}
                  </Text>
                ) : null}
              </View>

              {interactive ? (
                <V2exIcon
                  name='chevron-right-outline'
                  size={13}
                  color={colors.tertiaryText}
                />
              ) : null}
            </View>
          </GlassSurface>
        </Pressable>
      </View>
    </View>
  )
}

function createStyles(colors: AIChatColors) {
  return StyleSheet.create({
    // Mirrors Composer's anchoring so the swap does not shift the layout.
    sticky: { position: 'absolute', left: 0, right: 0, bottom: 0 },
    outer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 10,
      paddingTop: 8,
    },
    pressable: { flex: 1 },
    surface: {
      minHeight: 56,
      borderRadius: 23,
      overflow: 'hidden',
      paddingHorizontal: 8,
      paddingVertical: 8,
      justifyContent: 'center',
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    leading: {
      width: 34,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: { borderRadius: 17 },
    text: { flex: 1, gap: 1 },
    notice: { fontSize: 14, fontWeight: '600' },
    action: { color: colors.secondaryText, fontSize: 12 },
  })
}
