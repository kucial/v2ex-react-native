import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Appearance, AppState, ColorSchemeName, StyleSheet } from 'react-native'

import { useAppSettings } from '../AppSettingsService'
import * as themes from './themes'
import { ThemeService, ThemeStyles } from './types'

export const useColorScheme = (delay = 250) => {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
  // const onColorSchemeChange = useCallback(
  //   throttle(
  //     ({ colorScheme }) => {
  //       setColorScheme(colorScheme)
  //     },
  //     delay,
  //     {
  //       leading: false,
  //     },
  //   ),
  //   [],
  // )
  // useEffect(() => {
  //   const subscription = Appearance.addChangeListener(onColorSchemeChange)
  //   return () => {
  //     onColorSchemeChange.cancel()
  //     subscription.remove()
  //   }
  // }, [])

  useEffect(() => {
    function handleColorSchemeChange() {
      const systemColorScheme = Appearance.getColorScheme()
      console.log(systemColorScheme, AppState.currentState)
      if (
        AppState.currentState === 'active' &&
        colorScheme !== systemColorScheme
      ) {
        setColorScheme(systemColorScheme)
      }
    }
    const subscriptionA = AppState.addEventListener(
      'change',
      handleColorSchemeChange,
    )
    const subscriptionB = Appearance.addChangeListener(handleColorSchemeChange)

    return () => {
      subscriptionA.remove()
      subscriptionB.remove()
    }
  }, [colorScheme])

  return {
    colorScheme,
    setColorScheme,
  }
}

const getActiveTheme = (
  theme: string,
  colorScheme: ColorSchemeName = 'light',
) => {
  const themeDef = themes[theme] || themes.r2v
  return themeDef[colorScheme]
}

const ThemeContext = createContext<ThemeService>({
  theme: {},
  styles: {},
  colorScheme: 'light',
} as ThemeService)

export const ThemeProvider = (props: {
  theme?: string
  colorScheme?: 'light' | 'dark'
  children: ReactNode
}) => {
  const { colorScheme } = useColorScheme()
  const {
    data: { theme: themeName },
  } = useAppSettings()

  const activeTheme = props.theme ?? themeName
  const activeScheme = props.colorScheme || colorScheme

  const service = useMemo(() => {
    const theme = getActiveTheme(activeTheme, activeScheme)
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
    return {
      colorScheme: activeScheme,
      theme,
      styles,
    }
  }, [activeScheme, activeTheme])

  return (
    <ThemeContext.Provider value={service}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
