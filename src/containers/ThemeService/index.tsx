import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Appearance, StyleSheet } from 'react-native'
import { throttle } from 'lodash'

import { MyTheme, ThemeService, ThemeStyles } from './types'

// 混合 navigation 的 theme
const themes: Record<string, MyTheme> = {
  light: {
    dark: false,
    colors: {
      primary: '#171717', // neutral[900]
      background: '#F2F2F2',
      card: '#ffffff',
      text: '#1C1C1E',
      border: '#cccccc',
      notification: '#b91c1c',

      white: '#ffffff',
      black: '#000000',

      success: '#15803d', // green[700]
      danger: '#b91c1c', // red[700]
      warning: '#fbbf24', // yellow[400]
      info: '#0284c7', // sky[600]
      skeleton: '#0000000f',

      // text
      text_title: '#262626',
      text_desc: '#44403c',
      text_meta: '#737373',
      text_placeholder: '#a3a3a3',
      text_link: '#2563eb',

      // border
      border_light: '#e5e7eb', // neutral[200]

      // background
      bg_overlay: '#ffffff',
      bg_layer1: '#ffffff',
      bg_layer2: '#f5f5f5', // neutral[100]
      bg_layer3: '#eaeaea', // neutral[150]

      bg_danger_mask: 'rgba(225, 29, 72, 0.03)', // rose[600]/8
      bg_highlight_mask: '#ffff0008',

      badge_bg: '#2563eb',
      badge_border: '#2563eb',

      bts_handle_bg: '#d4d4d4', // neutral[300]
      html_pre_bg: '#f5f5f5', // neutral[100]
      icon_collected_bg: '#facc15', // yellow[400]
      icon_liked_bg: '#b91c1c', // red[700]
      icon_markdown_bg: '#15803d', // green[700]
      tag_bg: '#a3a3a3', // neutral[400]
      // others
      overlay_input_bg: '#f5f5f5',
      input_bg: '#f5f5f5', // neutral 100
    },
  },
  dark: {
    dark: true,
    colors: {
      primary: '#fffbeb', // neutral[900]
      background: '#101010',
      card: '#171717', // neutral[900]
      text: '#d4d4d4', // neutral[200]
      border: '#525252',
      notification: '#e11d48',

      white: '#f5f5f5',
      black: '#101010',

      success: '#34d399', // colors.emerald[400]
      danger: '#e11d48', // rose[600]
      warning: '#eab308', // yellow[500]
      info: '#06b6d4', // colors.cyan[500]
      skeleton: '#ffffff0f', // neutral[750]

      text_title: '#e5e5e5',
      text_desc: '#a3a3a3', // netural[400]
      text_meta: '#8a8a8a', // neutral[450]
      text_placeholder: '#737373', // neutral[600]
      text_link: '#7dd3fc', // sky[300]

      text_danger_inverse: '#f5f5f5',
      text_primary_inverse: '#171717',
      text_info_inverse: '#f5f5f5',
      text_badge_inverse: '#171717',
      text_tag_inverse: '#cccccc', // neutral[300]

      border_light: '#383838', // neutral[700]

      bg_overlay: '#262626',
      bg_layer1: '#171717', // neutral[900]
      bg_layer2: '#262626', // neutral[800]
      bg_layer3: '#333333', // neutral[750] custom

      bg_danger_mask: 'rgba(225, 29, 72, 0.05)', // rose[600]/8
      bg_highlight_mask: '#ffff8808',

      badge_bg: '#38bdf8', //sky[400]
      badge_border: '#38bdf8', //sky[400]

      bts_handle_bg: '#a3a3a3', // neutral[400]
      html_pre_bg: '#262626', // neutral[800]

      icon_collected_bg: '#fef08a', // yellow[200]
      icon_liked_bg: '#fb7185', // rose[400]
      icon_markdown_bg: '#a7f3d0', // emerald[200]

      tag_bg: '#404040', // neutral[600]
      overlay_input_bg: '#171717',
      input_bg: '#404040', // neutral[700]
    },
  },
}

export const useColorScheme = (delay = 250) => {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
  const onColorSchemeChange = useCallback(
    throttle(
      ({ colorScheme }) => {
        setColorScheme(colorScheme)
      },
      delay,
      {
        leading: false,
      },
    ),
    [],
  )
  useEffect(() => {
    const subscription = Appearance.addChangeListener(onColorSchemeChange)
    return () => {
      onColorSchemeChange.cancel()
      subscription.remove()
    }
  }, [])
  return {
    colorScheme,
    setColorScheme,
  }
}

const ThemeContext = createContext<ThemeService>({
  theme: {},
  styles: {},
  colorScheme: 'light',
  setColorScheme: (str) => {
    console.log('setColorScheme: ', str)
  },
} as ThemeService)

export const ThemeProvider = (props) => {
  const { colorScheme, setColorScheme } = useColorScheme()

  const service = useMemo(() => {
    const theme = themes[colorScheme]
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
    })
    return {
      colorScheme,
      setColorScheme,
      theme,
      styles,
    }
  }, [colorScheme])

  return (
    <ThemeContext.Provider value={service}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
