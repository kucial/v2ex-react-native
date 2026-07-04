import {
  Appearance,
  ColorSchemeName,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native'

import {
  getActiveFontScale,
  getActiveTheme,
  getUsePureDarkTheme,
} from '../AppSettingsService'
import * as themes from './themes'
import { SemanticType, ThemeService, ThemeStyles } from './types'

const themeServiceMap: Record<string, ThemeService> = {}
type ActiveColorScheme = 'light' | 'dark'
type ThemeVariant = ActiveColorScheme | 'pure_dark'

const normalizeColorScheme = (
  colorScheme?: ColorSchemeName | null,
): ActiveColorScheme => {
  return colorScheme === 'dark' ? 'dark' : 'light'
}

export function getThemeService(
  themeName?: string,
  colorScheme?: ColorSchemeName,
  fontScale?: number,
  pureDarkTheme?: boolean,
): ThemeService {
  const scale = fontScale || getActiveFontScale()
  const scheme = normalizeColorScheme(
    colorScheme ?? Appearance.getColorScheme(),
  )
  const name = themeName || getActiveTheme(scheme)
  const usePureDark = pureDarkTheme ?? getUsePureDarkTheme()

  const subkey: ThemeVariant =
    scheme === 'dark' && usePureDark ? 'pure_dark' : scheme

  const key = `${name}-${subkey}-${scale}`

  if (!themeServiceMap[key]) {
    if (__DEV__) {
      console.log('construct theme', name, scheme, usePureDark)
    }

    const theme = ((themes as Record<string, typeof themes.r2v>)[name] ||
      themes.r2v)[subkey]

    // On a dark theme the background is dark, so contrast text should be light
    const contrastTextColor = theme.dark
      ? theme.colors.black
      : theme.colors.white

    const styles = StyleSheet.create<ThemeStyles>({
      text_xs: {
        fontSize: 12 * scale,
        lineHeight: 16 * scale,
      },
      text_sm: {
        fontSize: 14 * scale,
        lineHeight: 20 * scale,
      },
      text_base: {
        fontSize: 16 * scale,
        lineHeight: 24 * scale,
      },
      text_lg: {
        fontSize: 18 * scale,
        lineHeight: 28 * scale,
      },
      text: {
        color: theme.colors.text,
      },
      text_title: {
        color: theme.colors.text_title,
      },
      text_desc: {
        color: theme.colors.text_desc,
      },
      text_meta: {
        color: theme.colors.text_meta,
      },
      text_primary: {
        color: theme.colors.primary,
      },
      text_danger: {
        color: theme.colors.danger,
      },
      text_link: {
        color: theme.colors.text_link,
      },
      text_placeholder: {
        color: theme.colors.text_placeholder,
      },
      btn_primary__bg: {
        backgroundColor: theme.colors.primary,
      },
      btn_primary__text: {
        color: theme.colors.text_primary_inverse || contrastTextColor,
      },
      btn_success__bg: {
        backgroundColor: theme.colors.success,
      },
      btn_success__text: {
        color: theme.colors.text_success_inverse || contrastTextColor,
      },
      btn_danger__bg: {
        backgroundColor: theme.colors.danger,
      },
      btn_danger__text: {
        color: theme.colors.text_danger_inverse || contrastTextColor,
      },
      btn_info__bg: {
        backgroundColor: theme.colors.info,
      },
      btn_info__text: {
        color: theme.colors.text_info_inverse || contrastTextColor,
      },
      btn_warning__bg: {
        backgroundColor: theme.colors.warning,
      },
      btn_warning__text: {
        // Fixed: was incorrectly referencing text_info_warning
        color: theme.colors.text_warning_inverse || contrastTextColor,
      },
      badge__bg: {
        backgroundColor: theme.colors.badge_bg,
      },
      badge__text: {
        color: theme.colors.text_badge_inverse || contrastTextColor,
      },
      input__bg: {
        backgroundColor: theme.colors.input_bg,
      },
      overlay_input__bg: {
        backgroundColor: theme.colors.overlay_input_bg,
      },
      layer1: {
        backgroundColor: theme.colors.bg_layer1,
      },
      layer2: {
        backgroundColor: theme.colors.bg_layer2,
      },
      layer3: {
        backgroundColor: theme.colors.bg_layer3,
      },
      overlay: {
        backgroundColor: theme.colors.bg_overlay,
      },
      grouped_secondary: {
        backgroundColor: theme.colors.bg_grouped_secondary,
      },
      underlay: {
        backgroundColor: theme.colors.background,
      },
      highlight: {
        backgroundColor: theme.colors.bg_highlight_mask,
      },
      border: {
        borderColor: theme.colors.border,
        borderWidth: StyleSheet.hairlineWidth,
      },
      border_b: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
      },
      border_t: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.border,
      },
      border_r: {
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: theme.colors.border,
      },
      border_l: {
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderLeftColor: theme.colors.border,
      },
      border_light: {
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.border_light,
      },
      border_b_light: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border_light,
      },
      border_t_light: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: theme.colors.border_light,
      },
      border_l_light: {
        borderLeftWidth: StyleSheet.hairlineWidth,
        borderLeftColor: theme.colors.border_light,
      },
      border_r_light: {
        borderRightWidth: StyleSheet.hairlineWidth,
        borderRightColor: theme.colors.border_light,
      },
      tag__bg: {
        backgroundColor: theme.colors.tag_bg,
      },
      tag__text: {
        color: theme.colors.text_badge_inverse || contrastTextColor,
      },
      shadow: {
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowColor: theme.colors.shadow,
      },
      shadow_light: {
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowColor: theme.colors.shadow,
      },
    })

    themeServiceMap[key] = {
      name,
      colorScheme: scheme,
      theme,
      styles,
    }
  }
  return themeServiceMap[key]
}

export type SemanticStyleResult = {
  container?: ViewStyle
  text?: TextStyle
  border?: ViewStyle
}

export const getSemanticStyle = (
  code: SemanticType,
  styles: ThemeStyles,
): SemanticStyleResult => {
  switch (code) {
    case 'default':
      return {
        container: styles.layer1,
        text: styles.text,
        border: styles.border,
      }
    case 'primary':
      return {
        container: styles.btn_primary__bg,
        text: styles.btn_primary__text,
      }
    case 'input':
      return { container: styles.input__bg, text: styles.text }
    case 'secondary':
      // Uses layer2 bg with primary-colored text (intentional — no dedicated btn_secondary styles)
      return { container: styles.layer2, text: styles.text_primary }
    case 'success':
      return {
        container: styles.btn_success__bg,
        text: styles.btn_success__text,
      }
    case 'danger':
    case 'error':
      return { container: styles.btn_danger__bg, text: styles.btn_danger__text }
    case 'info':
      return { container: styles.btn_info__bg, text: styles.btn_info__text }
    case 'warning':
    case 'warn':
      return {
        container: styles.btn_warning__bg,
        text: styles.btn_warning__text,
      }
    case 'custom':
    default:
      return {}
  }
}
