import { useMemo } from 'react'

import { useTheme } from '@/containers/ThemeService'

export type AIChatColors = {
  background: string
  recentsBackground: string
  elevated: string
  elevatedStrong: string
  glassFallback: string
  composerGlass: string
  border: string
  text: string
  secondaryText: string
  tertiaryText: string
  mutedText: string
  userBubble: string
  accent: string
  accentText: string
  danger: string
  dangerText: string
  dangerBorder: string
  dangerBackground: string
  codeText: string
  inlineCodeBackground: string
  codeBlockBackground: string
  link: string
  blockquoteText: string
  blockquoteBorder: string
  shadow: string
  backdrop: string
  grabber: string
  glowStart: string
  glowEnd: string
}

export function useAIChatTheme() {
  const service = useTheme()
  const { theme } = service
  const colors = useMemo<AIChatColors>(() => {
    const dark = theme.dark
    return {
      background: theme.colors.bg_layer1,
      recentsBackground: theme.colors.background as string,
      elevated: theme.colors.bg_layer2,
      elevatedStrong: theme.colors.bg_overlay,
      glassFallback: dark ? 'rgba(30,30,31,0.94)' : 'rgba(255,255,255,0.94)',
      composerGlass: dark ? 'rgba(34,34,35,0.94)' : 'rgba(255,255,255,0.96)',
      border: theme.colors.border_light,
      text: theme.colors.text_title,
      secondaryText: theme.colors.text_desc,
      tertiaryText: theme.colors.text_meta,
      mutedText: theme.colors.text_placeholder,
      userBubble: theme.colors.bg_layer3,
      accent: theme.colors.primary as string,
      accentText:
        theme.colors.text_primary_inverse ??
        (dark ? theme.colors.black : theme.colors.white),
      danger: theme.colors.danger,
      dangerText: theme.colors.danger,
      dangerBorder: theme.colors.danger,
      dangerBackground: theme.colors.bg_danger_mask,
      codeText: theme.colors.text as string,
      inlineCodeBackground: theme.colors.bg_layer2,
      codeBlockBackground: theme.colors.html_pre_bg,
      link: theme.colors.text_link,
      blockquoteText: theme.colors.text_desc,
      blockquoteBorder: theme.colors.border as string,
      shadow: theme.colors.shadow,
      backdrop: dark ? 'rgba(0,0,0,0.58)' : 'rgba(0,0,0,0.32)',
      grabber: theme.colors.bts_handle_bg,
      glowStart: dark ? 'rgba(56,115,150,0.16)' : 'rgba(90,165,210,0.12)',
      glowEnd: dark ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)',
    }
  }, [theme])

  return { ...service, colors }
}
