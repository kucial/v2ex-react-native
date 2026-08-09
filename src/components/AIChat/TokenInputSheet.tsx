import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { useRouter } from 'expo-router'

import V2exIcon from '@/components/icons/V2exIcon'

import { PersonalTokenSource } from '@/containers/AIChatService'

import { pressFeedbackStyles } from './pressFeedback'
import { AIChatColors, useAIChatTheme } from './theme'

export type TokenInputSheetHandle = {
  /**
   * `reason` is shown in the error slot, so a sheet opened by a guard can say
   * what it is blocking on instead of appearing unprompted.
   */
  present: (reason?: string) => void
}

// The token is account-level and sent as `Authorization: Bearer`, so the host
// serving this settings page does not affect which tokens the chat API accepts.
// www.v2ex.com matches BASE_URL, which is where the app's session cookies are
// stored — so an in-app WebView reaches this page already signed in.
const TOKEN_SETTINGS_URL = 'https://www.v2ex.com/settings/tokens'
const TOKEN_ACTION_VISIBILITY_OFFSET = 68

type Props = {
  source: PersonalTokenSource
  maskedToken: string
  onSave: (token: string) => Promise<void>
  onClear: () => Promise<void>
  // Called before navigating away, so the caller can dismiss whatever sheet it
  // opened this one from. This sheet can be presented on top of another (the
  // persona picker), and a sheet left presented would cover the pushed screen.
  onBeforeNavigate?: () => Promise<void> | void
}

export default forwardRef<TokenInputSheetHandle, Props>(
  function TokenInputSheet(
    { source, maskedToken, onSave, onClear, onBeforeNavigate },
    ref,
  ) {
    const sheetRef = useRef<TrueSheet>(null)
    const router = useRouter()
    const { colors } = useAIChatTheme()
    const styles = useMemo(() => createStyles(colors), [colors])
    const [token, setToken] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string>()
    const inputRef = useRef<TextInput>(null)

    useImperativeHandle(ref, () => ({
      present: (reason?: string) => {
        setToken('')
        setError(reason)
        void sheetRef.current?.present()
      },
    }))

    const save = async () => {
      const cleaned = token.trim()
      if (!cleaned) {
        setError('请输入 V2EX Personal Access Token。')
        return
      }
      setSaving(true)
      setError(undefined)
      try {
        await onSave(cleaned)
        setToken('')
        await sheetRef.current?.dismiss()
      } catch (nextError) {
        setError(
          nextError instanceof Error ? nextError.message : 'Token 验证失败。',
        )
      } finally {
        setSaving(false)
      }
    }

    // Route to the in-app browser rather than SFSafariViewController / Safari:
    // BrowserScreen's WebView has sharedCookiesEnabled, so it sends the app's
    // own www.v2ex.com session and the user lands on the token page already
    // signed in. An external browser has an isolated cookie store and would
    // make them log in again just to read their own token.
    //
    // Dismiss first — a sheet left presented would sit on top of the pushed
    // screen instead of navigating out from under it.
    const openTokenSettings = async () => {
      await sheetRef.current?.dismiss()
      await onBeforeNavigate?.()
      router.push({
        pathname: '/browser',
        params: { url: TOKEN_SETTINGS_URL },
      })
    }

    const clear = () => {
      Alert.alert('移除 Token？', '移除后，下次聊天前需要重新手动输入。', [
        { text: '取消', style: 'cancel' },
        {
          text: '移除',
          style: 'destructive',
          onPress: async () => {
            setSaving(true)
            try {
              await onClear()
              setToken('')
              await sheetRef.current?.dismiss()
            } finally {
              setSaving(false)
            }
          },
        },
      ])
    }

    return (
      <TrueSheet
        ref={sheetRef}
        detents={['auto']}
        grabber
        backgroundColor={colors.elevatedStrong}
        onDidPresent={() => {
          if (token?.trim().length > 0) {
            inputRef.current?.focus()
          }
        }}
      >
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <V2exIcon name='key-outline' size={19} color={colors.text} />
            <Text style={styles.title}>V2EX Token</Text>
          </View>
          {/* The link is nested inline rather than sitting in a row beside the
              text — as a sibling it could not shrink and overflowed the sheet. */}
          <Text style={styles.description}>
            请在个人设置页面中创建Token后，粘贴到此处。{' '}
            <Text
              style={styles.link}
              accessibilityRole='link'
              onPress={() => void openTokenSettings()}
            >
              打开token设置页面
            </Text>
          </Text>

          <TextInput
            accessibilityLabel='V2EX Personal Access Token'
            autoCapitalize='none'
            autoCorrect={false}
            secureTextEntry
            editable={!saving}
            placeholder={
              source === 'secure' && maskedToken ? maskedToken : '输入 Token'
            }
            placeholderTextColor={
              source === 'secure' ? colors.secondaryText : colors.tertiaryText
            }
            value={token}
            onChangeText={setToken}
            onSubmitEditing={() => void save()}
            style={styles.input}
            ref={inputRef}
          />

          {error ? (
            <Text accessibilityRole='alert' style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Pressable
            accessibilityLabel='验证并保存 Token'
            accessibilityRole='button'
            accessibilityState={{ disabled: saving || !token.trim() }}
            disabled={saving || !token.trim()}
            onPress={() => void save()}
            style={({ pressed }) => [
              styles.saveButton,
              (saving || !token.trim()) && styles.disabled,
              pressed && pressFeedbackStyles.regular,
            ]}
          >
            <Text style={styles.saveText}>
              {saving ? '正在验证…' : '验证并保存'}
            </Text>
          </Pressable>

          {source === 'secure' ? (
            <Pressable
              accessibilityLabel='移除已保存的 Token'
              accessibilityRole='button'
              accessibilityState={{ disabled: saving }}
              disabled={saving}
              onPress={clear}
              style={({ pressed }) => [
                styles.removeButton,
                saving && styles.disabled,
                pressed && pressFeedbackStyles.regular,
              ]}
            >
              <Text style={styles.removeText}>移除已保存的 Token</Text>
            </Pressable>
          ) : null}
        </View>
      </TrueSheet>
    )
  },
)

function createStyles(colors: AIChatColors) {
  return StyleSheet.create({
    content: {
      padding: 16,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
    title: { color: colors.text, fontSize: 20, fontWeight: '700' },
    description: {
      color: colors.secondaryText,
      fontSize: 13.5,
      lineHeight: 20,
      marginTop: 10,
    },
    link: {
      color: colors.link,
      fontSize: 13.5,
      lineHeight: 20,
    },
    input: {
      height: 48,
      marginTop: 18,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.elevated,
      color: colors.text,
      fontSize: 15,
    },
    error: { marginTop: 9, color: colors.dangerText, fontSize: 13 },
    saveButton: {
      height: 46,
      marginTop: 16,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
    },
    saveText: { color: colors.accentText, fontSize: 15, fontWeight: '700' },
    disabled: { opacity: 0.38 },
    removeButton: { alignItems: 'center', paddingTop: 18, paddingBottom: 4 },
    removeText: { color: colors.danger, fontSize: 14, fontWeight: '600' },
  })
}
