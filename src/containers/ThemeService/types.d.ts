import type { TextStyle, ViewStyle } from 'react-native'
import type { Theme } from '@react-navigation/native'

interface ThemeTextStyle {
  color?: string
  fontFamily?: string | undefined
  fontSize?: number | undefined
  fontWeight?: TextStyle['fontWeight']
}

interface ThemeBackgroundStyle {
  backgroundColor?: string
}

type SemanticType =
  | 'primary'
  | 'default'
  | 'secondary'
  | 'warn'
  | 'warning'
  | 'danger'
  | 'error'
  | 'info'
  | 'success'
  | 'input'
  | 'custom'
  | 'icon'

type ThemeColors = Theme['colors'] & {
  white: string
  black: string

  // semantic
  success: string
  danger: string
  warning: string
  info: string

  skeleton: string

  // text
  text_title: string
  text_desc: string
  text_meta: string
  text_placeholder: string
  text_link: string

  // element text
  text_danger_inverse?: string
  text_primary_inverse?: string
  text_success_inverse?: string
  text_info_inverse?: string
  text_badge_inverse?: string
  text_tag_inverse?: string

  // border
  border_light: string

  // background
  bg_overlay: string
  bg_layer1: string
  bg_layer2: string
  bg_layer3: string
  shadow: string

  bg_danger_mask: string
  bg_highlight_mask: string

  // badge
  badge_bg: string
  badge_border: string
  // bottom_sheet
  bts_handle_bg: string // bottom_sheet_handle
  // html
  html_pre_bg: string
  // icons
  icon_collected_bg: string
  icon_liked_bg: string
  icon_markdown_bg: string
  // tag
  tag_bg: string
  // others
  overlay_input_bg: string
  input_bg: string

  // swtich
  switch_track?: string
}
type ThemeStyles = {
  text: ThemeTextStyle
  text_desc: ThemeTextStyle
  text_meta: TextStyle
  text_primary: TextStyle
  text_danger: TextStyle
  text_link: TextStyle
  text_placeholder: TextStyle
  btn_primary__bg: ViewStyle
  btn_primary__text: TextStyle
  btn_danger__bg: ViewStyle
  btn_danger__text: TextStyle
  btn_success__bg: ViewStyle
  btn_success__text: TextStyle
  btn_warning__bg: ViewStyle
  btn_warning__text: TextStyle
  btn_info__bg: ViewStyle
  btn_info__text: ViewStyle
  badge__bg: ViewStyle
  badge__text: TextStyle
  input__bg: ViewStyle
  overlay_input__bg: ViewStyle
  layer1: ThemeBackgroundStyle
  layer2: ThemeBackgroundStyle
  layer3: ThemeBackgroundStyle
  underlay: ThemeBackgroundStyle
  overlay: ViewStyle
  highlight: ViewStyle
  border: ViewStyle
  border_light: ViewStyle
  border_b: ViewStyle
  border_t: ViewStyle
  border_r: ViewStyle
  border_l: ViewStyle
  border_b_light: ViewStyle
  border_t_light: ViewStyle
  border_r_light: ViewStyle
  border_l_light: ViewStyle
  tag__bg: ViewStyle
  tag__text: TextStyle
  shadow: ViewStyle
  shadow_light: ViewStyle
}

type MyTheme = {
  dark: boolean
  colors: ThemeColors
}

type MyThemeDefinition = {
  title: string
  name: string
  light: MyTheme
  dark: MyTheme
}

type ThemeService = {
  theme: MyTheme
  styles: ThemeStyles
  colorScheme: 'light' | 'dark'
  getSemanticStyle(code: SemanticType): [ViewStyle?, TextStyle?, ViewStyle?]
}

declare module 'react-native' {
  namespace StyleSheet {
    type NamedStyles<T> = {
      [P in keyof T]:
        | ViewStyle
        | TextStyle
        | ImageStyle
        | ThemeTextStyle
        | ThemeBackgroundStyle
    }
  }
}
