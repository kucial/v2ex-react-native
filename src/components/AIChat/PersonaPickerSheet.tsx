import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { FlashList } from '@shopify/flash-list'

import V2exIcon from '@/components/icons/V2exIcon'

import {
  PersonaLoadState,
  PersonalTokenSource,
} from '@/containers/AIChatService'
import { AIChatPersonaSummary } from '@/types/ai-chat'

import { pressFeedbackStyles } from './pressFeedback'
import { AIChatColors, useAIChatTheme } from './theme'

const SHEET_CHROME_HEIGHT = 162
const PERSONA_ROW_HEIGHT = 54
const STATUS_HEIGHT = 120
const MAX_SHEET_CONTENT_HEIGHT = 720

export type PersonaPickerSheetHandle = { present: () => void }

type Props = {
  selectedPersona: string
  personas: AIChatPersonaSummary[]
  hasLoadedPersonas: boolean
  loadState: PersonaLoadState
  error?: string
  tokenSource: PersonalTokenSource
  onSelect: (persona: string) => void
  onRetry: () => Promise<void>
  onManageToken: () => void
}

export default forwardRef<PersonaPickerSheetHandle, Props>(
  function PersonaPickerSheet(props, ref) {
    const sheetRef = useRef<TrueSheet>(null)
    const { colors } = useAIChatTheme()
    const styles = useMemo(() => createStyles(colors), [colors])
    const [query, setQuery] = useState('')

    useImperativeHandle(ref, () => ({
      present: () => {
        setQuery('')
        void sheetRef.current?.present()
      },
    }))

    const filtered = useMemo(() => {
      const needle = query.trim().toLowerCase()
      if (!needle) return props.personas
      return props.personas.filter((persona) =>
        persona.id.toLowerCase().includes(needle),
      )
    }, [props.personas, query])

    const select = async (persona: string) => {
      props.onSelect(persona)
      await sheetRef.current?.dismiss()
    }

    const hasUsablePersonas =
      props.hasLoadedPersonas && props.personas.length > 0
    const showingStatus =
      (!hasUsablePersonas &&
        (props.loadState === 'error' || props.loadState === 'loading')) ||
      filtered.length === 0
    const bodyHeight = showingStatus
      ? STATUS_HEIGHT
      : Math.min(
          filtered.length * PERSONA_ROW_HEIGHT,
          MAX_SHEET_CONTENT_HEIGHT - SHEET_CHROME_HEIGHT,
        )
    const contentHeight = SHEET_CHROME_HEIGHT + bodyHeight

    useEffect(() => {
      const frame = requestAnimationFrame(() => {
        void sheetRef.current?.resize(0).catch(() => {})
      })
      return () => cancelAnimationFrame(frame)
    }, [contentHeight])

    return (
      <TrueSheet
        ref={sheetRef}
        detents={['auto']}
        cornerRadius={28}
        grabber
        maxContentHeight={MAX_SHEET_CONTENT_HEIGHT}
        backgroundColor={colors.elevatedStrong}
      >
        <View style={[styles.content, { height: contentHeight }]}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>选择 Persona</Text>
              <Text style={styles.subtitle}>每个对话可以使用不同的模型</Text>
            </View>
            <Pressable
              accessibilityLabel='刷新 Persona'
              accessibilityRole='button'
              accessibilityState={{
                disabled: props.tokenSource === 'none',
              }}
              disabled={props.tokenSource === 'none'}
              onPress={() => void props.onRetry()}
              style={({ pressed }) => [
                styles.iconButton,
                props.tokenSource === 'none' && styles.disabled,
                pressed && pressFeedbackStyles.compact,
              ]}
            >
              <V2exIcon
                name='arrow-path-outline'
                size={18}
                color={colors.text}
              />
            </Pressable>
          </View>

          <Pressable
            accessibilityLabel='管理 V2EX Token'
            accessibilityRole='button'
            onPress={props.onManageToken}
            style={({ pressed }) => [
              styles.tokenButton,
              pressed && pressFeedbackStyles.regular,
            ]}
          >
            <V2exIcon name='key-outline' size={15} color={colors.text} />
            <Text style={styles.tokenText}>
              {props.tokenSource === 'secure'
                ? '更新或移除 Token'
                : '输入 Token'}
            </Text>
            <V2exIcon
              name='chevron-right-outline'
              size={13}
              color={colors.tertiaryText}
            />
          </Pressable>

          <View style={styles.searchBox}>
            <V2exIcon
              name='magnifying-glass-outline'
              size={14}
              color={colors.tertiaryText}
            />
            <TextInput
              accessibilityLabel='搜索 Persona'
              placeholder='搜索 Persona'
              placeholderTextColor={colors.tertiaryText}
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
            />
          </View>

          {props.loadState === 'error' && !hasUsablePersonas ? (
            <View accessibilityRole='alert' style={styles.status}>
              <Text style={styles.errorText}>
                {props.error || '无法加载 V2EX Persona。'}
              </Text>
              <Pressable
                accessibilityLabel={
                  props.tokenSource === 'none' ? '输入 Token' : '重试'
                }
                accessibilityRole='button'
                onPress={
                  props.tokenSource === 'none'
                    ? props.onManageToken
                    : () => void props.onRetry()
                }
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && pressFeedbackStyles.regular,
                ]}
              >
                <Text style={styles.retryText}>
                  {props.tokenSource === 'none' ? '输入 Token' : '重试'}
                </Text>
              </Pressable>
            </View>
          ) : props.loadState === 'loading' && !hasUsablePersonas ? (
            <View style={styles.status}>
              <ActivityIndicator color={colors.secondaryText} />
              <Text style={styles.statusText}>正在加载 Persona…</Text>
            </View>
          ) : (
            <FlashList
              data={filtered}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps='handled'
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.status}>
                  <Text style={styles.statusText}>没有匹配的 Persona</Text>
                </View>
              }
              renderItem={({ item }) => {
                const selected = item.id === props.selectedPersona
                return (
                  <Pressable
                    accessibilityLabel={`使用 ${item.id} Persona`}
                    accessibilityRole='button'
                    accessibilityState={{ selected }}
                    onPress={() => void select(item.id)}
                    style={({ pressed }) => [
                      styles.row,
                      selected && styles.rowSelected,
                      pressed && pressFeedbackStyles.regular,
                    ]}
                  >
                    <View style={styles.rowText}>
                      <Text numberOfLines={1} style={styles.personaName}>
                        {item.id}
                      </Text>
                      {item.ownedBy ? (
                        <Text style={styles.owner}>由 {item.ownedBy} 提供</Text>
                      ) : null}
                    </View>
                    {selected ? (
                      <V2exIcon
                        name='check-outline'
                        size={15}
                        color={colors.text}
                      />
                    ) : null}
                  </Pressable>
                )
              }}
            />
          )}
        </View>
      </TrueSheet>
    )
  },
)

function createStyles(colors: AIChatColors) {
  return StyleSheet.create({
    content: { paddingTop: 10 },
    header: {
      minHeight: 58,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: { color: colors.text, fontSize: 19, fontWeight: '700' },
    subtitle: { marginTop: 2, color: colors.tertiaryText, fontSize: 12 },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabled: { opacity: 0.35 },
    tokenButton: {
      height: 38,
      marginHorizontal: 16,
      marginBottom: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.elevated,
    },
    tokenText: { flex: 1, color: colors.secondaryText, fontSize: 13 },
    searchBox: {
      height: 40,
      marginHorizontal: 16,
      marginBottom: 8,
      paddingHorizontal: 12,
      borderRadius: 13,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.elevated,
    },
    searchInput: { flex: 1, color: colors.text, fontSize: 15 },
    status: {
      height: STATUS_HEIGHT,
      paddingHorizontal: 28,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    statusText: { color: colors.secondaryText, fontSize: 14 },
    errorText: {
      color: colors.dangerText,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    retryButton: {
      minHeight: 34,
      paddingHorizontal: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.elevated,
    },
    retryText: { color: colors.text, fontWeight: '600' },
    row: {
      minHeight: 54,
      marginHorizontal: 10,
      paddingHorizontal: 12,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    rowSelected: { backgroundColor: colors.elevated },
    rowText: { flex: 1 },
    personaName: { color: colors.text, fontSize: 15.5, fontWeight: '600' },
    owner: { marginTop: 2, color: colors.tertiaryText, fontSize: 11 },
  })
}
