import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useMemo } from 'react'
import { Appearance, StyleSheet } from 'react-native'
import { throttle } from 'lodash'
import { neutral } from 'tailwindcss/colors'

// 混合 navigation 的 theme
const themes = {
  light: {
    dark: false,
    colors: {
      background: '#F2F2F2',
      border: '#cccccc',
      text: '#1C1C1E',
      primary: '#171717', // neutral[900]
      danger: '#b91c1c', // red[700]
      notification: '#b91c1c',
      warning: '#fbbf24', // yellow[400]
      success: '#15803d', // green[700]
      info: '#0284c7', // sky[600]
      card: '#ffffff',
      skeleton: '#0000000f',
      white: '#ffffff',
      badge: '#2563eb',

      text_title: '#262626',
      text_placeholder: '#a3a3a3',
      text_desc: '#44403c', // netural[700]
      text_meta: '#737373', // neutral[500]
      text_link: '#2563eb', // blue[600]
      text_danger_inverse: '#ffffff',
      text_primary_inverse: '#ffffff',
      text_tag: '#ffffff', // white
      text_info_inverse: '#ffffff',
      text_badge_inverse: '#ffffff',

      refresh_tint: '#171717',
      border_light: '#e5e7eb', // neutral[200]

      bg_overlay: '#ffffff',
      bg_layer1: '#ffffff',
      bg_layer2: '#f5f5f5', // neutral[100]
      bg_layer3: '#eaeaea', // neutral[150]

      bg_input: '#f5f5f5', // neutral 100
      bg_bottom_sheet_handle: '#d4d4d4', // neutral[300]
      bg_pre: '#f5f5f5', // neutral[100]
      bg_collected: '#facc15', // yellow[400]
      bg_liked: '#b91c1c', // red[700]
      bg_markdown: '#15803d', // green[700]
      bg_tag: '#a3a3a3', // neutral[400]
      bg_danger_mask: 'rgba(225, 29, 72, 0.03)', // rose[600]/8
      bg_highlight: '#ffff0008',
      bg_overlay_input: '#f5f5f5',

      selection: '#525252',
    },
  },
  dark: {
    dark: true,
    colors: {
      background: '#101010', // neutral[950] custom
      border: '#525252', // colors.neutral[600]
      // primary: '#818cf8',
      primary: '#fffbeb', // amber[50]
      danger: '#e11d48', // rose[600]
      notification: '#e11d48',
      warning: '#eab308', // yellow[500]
      success: '#34d399', // colors.emerald[400]
      info: '#06b6d4', // colors.cyan[500]
      card: '#171717', // neutral[900]
      badge: '#38bdf8', //sky[400]
      white: '#f5f5f5',

      skeleton: '#ffffff0f', // neutral[750]

      bg_overlay: '#262626',
      bg_layer1: '#171717', // neutral[900]
      bg_layer2: '#262626', // neutral[800]
      bg_layer3: '#333333', // neutral[750] custom
      bg_bottom_sheet_handle: '#a3a3a3', // neutral[400]
      bg_input: '#404040', // neutral[700]
      bg_pre: '#262626', // neutral[800]
      bg_collected: '#fef08a', // yellow[200]
      bg_liked: '#fb7185', // rose[400]
      bg_markdown: '#a7f3d0', // emerald[200]
      bg_tag: '#404040', // neutral[600]
      bg_danger_mask: 'rgba(225, 29, 72, 0.05)', // rose[600]/8
      bg_highlight: '#ffff8808',
      bg_overlay_input: '#171717',

      refresh_tint: '#d4d4d4', // neutral[300]
      border_light: '#404040', // neutral[700]
      text: '#d4d4d4', // neutral[200]
      text_desc: '#a3a3a3', // netural[400]
      text_meta: '#8a8a8a', // neutral[450]
      text_title: '#e5e5e5',
      text_tag: '#cccccc', // neutral[300]
      text_placeholder: '#737373', // neutral[600]
      text_link: '#7dd3fc', // sky[300]
      text_danger_inverse: '#f5f5f5',
      text_primary_inverse: '#171717',
      text_info_inverse: '#f5f5f5',
      text_badge_inverse: '#171717',
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

const ThemeContext = createContext({
  theme: {},
  styles: {},
  colorScheme: 'light',
  setColorScheme: () => {},
})

export const ThemeProvider = (props) => {
  const { colorScheme, setColorScheme } = useColorScheme()

  const service = useMemo(() => {
    const theme = themes[colorScheme]
    const styles = StyleSheet.create({
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
      btn_primary: {
        bg: {
          backgroundColor: theme.colors.primary,
        },
        text: {
          color: theme.colors.text_primary_inverse,
        },
      },
      btn_danger: {
        bg: {
          backgroundColor: theme.colors.danger,
        },
        text: {
          color: theme.colors.text_danger_inverse,
        },
      },
      btn_info: {
        text: {
          color: theme.colors.text_info_inverse,
        },
      },
      badge: {
        bg: {
          backgroundColor: theme.colors.badge,
        },
        text: {
          color: theme.colors.text_badge_inverse,
        },
      },
      input: {
        bg: {
          backgroundColor: theme.colors.bg_input,
        },
      },
      overlay_input: {
        bg: {
          backgroundColor: theme.colors.bg_overlay_input,
        },
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
        backgroundColor: theme.colors.bg_highlight,
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
      border_light: {
        borderColor: theme.colors.border_light,
      },
      tag: {
        bg: {
          backgroundColor: theme.colors.bg_tag,
        },
        text: {
          color: theme.colors.text_tag,
        },
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
