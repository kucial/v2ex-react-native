import {
  Appearance,
  ColorSchemeName,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native'

import { getActiveTheme } from '../AppSettingsService'
import * as themes from './themes'
import { SemanticType, ThemeService, ThemeStyles } from './types'

const themeServiceMap = {}

export function getThemeService(
  themeName?: string,
  colorScheme?: ColorSchemeName,
): ThemeService {
  const name = themeName || getActiveTheme()
  const scheme = colorScheme || Appearance.getColorScheme()

  const key = `${name}-${scheme}`
  if (!themeServiceMap[key]) {
    console.log('construct theme', name, scheme)
    const theme = (themes[name] || themes.r2v)[scheme]
    const contrastTextColor = theme.dark
      ? theme.colors.black
      : theme.colors.white

    const styles = StyleSheet.create<ThemeStyles>({
      text: {
        color: theme.colors.text,
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
        color: theme.colors.text_info_warning || contrastTextColor,
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
      colorScheme: colorScheme,
      theme,
      styles,
    }
  }
  return themeServiceMap[key]
}

export const getSemanticStyle = (
  code: SemanticType,
  styles: ThemeStyles,
): [ViewStyle?, TextStyle?, ViewStyle?] => {
  switch (code) {
    case 'default':
      return [styles.layer1, styles.text, styles.border]
    case 'primary':
      return [styles.btn_primary__bg, styles.btn_primary__text]
    case 'input':
      return [styles.input__bg, styles.text]
    case 'secondary':
      return [styles.layer2, styles.text_primary]
    case 'success':
      return [styles.btn_success__bg, styles.btn_success__text]
    case 'danger':
    case 'error':
      return [styles.btn_danger__bg, styles.btn_danger__text]
    case 'info':
      return [styles.btn_info__bg, styles.btn_info__text]
    case 'warning':
    case 'warn':
      return [styles.btn_warning__bg, styles.btn_warning__text]
    case 'custom':
    default:
      return []
  }
}
