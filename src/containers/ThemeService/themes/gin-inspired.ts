import Color from 'color'

import { MyThemeDefinition } from '../types'

const createTheme = (info): MyThemeDefinition => ({
  title: info.title,
  name: info.name,
  light: {
    dark: false,
    colors: {
      primary: info.accent_light,
      background: Color('#FbFbFb')
        .mix(Color(info.accent_light).alpha(0.8), 0.01)
        .toString(),
      card: '#ffffff', // TOOD...
      border: Color('#cccccc').mix(Color(info.accent_light), 0.1).toString(),
      notification: '#b91c1c',

      white: '#ffffff',
      black: '#000000',

      success: '#15803d', // green[700]
      danger: '#b91c1c', // red[700]
      warning: '#fbbf24', // yellow[400]
      info: '#0284c7', // sky[600]
      skeleton: Color('#111111')
        .mix(Color(info.accent_light), 0.1)
        .alpha(0.05)
        .toString(),

      // NOTE: navigation theme value
      text: Color('#222222').mix(Color(info.accent_light), 0.06).toString(),
      text_title: Color('#222222')
        .mix(Color(info.accent_light), 0.06)
        .toString(),
      text_desc: Color('#444444').mix(Color(info.accent_light), 0.1).toString(),
      text_meta: Color('#545454').mix(Color(info.accent_light), 0.1).toString(),
      text_placeholder: Color('#a3a3a3')
        .mix(Color(info.accent_light), 0.1)
        .toString(),
      text_link: info.accent_light,

      // border
      border_light: Color('#e5e5e5')
        .mix(Color(info.accent_light), 0.1)
        .toString(), // neutral[200]

      // background
      bg_overlay: '#ffffff',
      bg_layer1: '#ffffff',
      bg_layer2: Color('#f5f5f5')
        .mix(Color(info.accent_light).alpha(0.5), 0.05)
        .toString(),
      bg_layer3: Color('#eaeaea')
        .mix(Color(info.accent_light).alpha(0.5), 0.1)
        .toString(),

      bg_danger_mask: Color('#b91c1c').alpha(0.04).toString(),
      bg_highlight_mask: Color(info.accent_light).alpha(0.04).toString(),

      badge_bg: info.accent_light,
      badge_border: info.accent_light,

      bts_handle_bg: Color('#d4d4d4')
        .mix(Color(info.accent_light), 0.1)
        .toString(), // neutral[300]
      html_pre_bg: Color('#f5f5f5')
        .mix(Color(info.accent_light), 0.03)
        .toString(),
      icon_collected_bg: '#facc15', // yellow[400]
      icon_liked_bg: '#b91c1c', // red[700]
      icon_markdown_bg: '#15803d', // green[700]
      tag_bg: Color('#a3a3a3').mix(Color(info.accent_light), 0.1).toString(),
      // others
      overlay_input_bg: Color('#f5f5f5')
        .mix(Color(info.accent_light).alpha(0.8), 0.03)
        .toString(),
      input_bg: Color('#f5f5f5').mix(Color(info.accent_light), 0.03).toString(),
      shadow: Color('#111111').mix(Color(info.accent_light), 0.2).toString(),
    },
  },
  dark: {
    dark: true,
    colors: {
      primary: info.accent_dark,
      background: Color('#101010')
        .mix(Color(info.accent_dark), 0.02)
        .toString(),
      card: Color('#171717').mix(Color(info.accent_dark), 0.02).toString(), // alias bg_layer1
      text: '#d4d4d4', // neutral[200]
      border: Color('#525252').mix(Color(info.accent_dark), 0.1).toString(),
      notification: '#e11d48',

      white: '#f5f5f5',
      black: '#101010',

      success: '#34d399', // colors.emerald[400]
      danger: '#e11d48', // rose[600]
      warning: '#eab308', // yellow[500]
      info: '#06b6d4', // colors.cyan[500]
      skeleton: Color('#d4d4d4')
        .mix(Color(info.accent_dark), 0.05)
        .alpha(0.05)
        .toString(),

      text_title: '#e5e5e5',
      text_desc: '#a3a3a3', // netural[400]
      text_meta: '#8a8a8a', // neutral[450]
      text_placeholder: '#737373', // neutral[600]
      text_link: info.accent_dark,

      text_danger_inverse: '#f5f5f5',
      text_primary_inverse: '#171717',
      text_info_inverse: '#f5f5f5',
      text_badge_inverse: '#171717',
      text_tag_inverse: '#cccccc', // neutral[300]

      border_light: Color('#383838')
        .mix(Color(info.accent_dark), 0.1)
        .toString(), // neutral[700]

      bg_overlay: Color('#262626')
        .mix(Color(info.accent_dark), 0.02)
        .toString(),
      bg_layer1: Color('#171717').mix(Color(info.accent_dark), 0.02).toString(),
      bg_layer2: Color('#262626')
        .mix(Color(info.accent_dark).alpha(0.9), 0.1)
        .toString(),
      bg_layer3: Color('#333333')
        .mix(Color(info.accent_dark).alpha(0.9), 0.1)
        .toString(),

      bg_danger_mask: Color('#e11d48').alpha(0.04).toString(), // rose[600]/8
      bg_highlight_mask: Color(info.accent_dark).alpha(0.04).toString(),

      badge_bg: info.accent_dark, //sky[400]
      badge_border: info.accent_dark, //sky[400]

      bts_handle_bg: Color('#a3a3a3')
        .mix(Color(info.accent_dark), 0.1)
        .toString(),
      html_pre_bg: Color('#171717')
        .mix(Color(info.accent_dark).alpha(0.9), 0.05)
        .toString(),

      icon_collected_bg: '#fef08a', // yellow[200]
      icon_liked_bg: '#fb7185', // rose[400]
      icon_markdown_bg: '#a7f3d0', // emerald[200]

      tag_bg: Color('#404040').mix(Color(info.accent_dark), 0.2).toString(), // neutral[600]
      overlay_input_bg: Color('#171717')
        .mix(Color(info.accent_dark).alpha(0.9), 0.05)
        .toString(),
      input_bg: Color('#171717')
        .mix(Color(info.accent_dark).alpha(0.9), 0.05)
        .toString(),
      shadow: Color('#111111').mix(Color(info.accent_light), 0.1).toString(),
    },
  },
})

export const gin_blue = createTheme({
  title: '蓝色',
  name: 'gin_blue',
  accent_light: '#0550e6',
  accent_dark: '#90aeef',
})

export const gin_dark_purple = createTheme({
  title: '深紫色',
  name: 'gin_dark_purple',
  accent_light: '#4300bf',
  accent_dark: '#ad8fe8',
})

export const gin_purple = createTheme({
  title: '紫色',
  name: 'gin_purple',
  accent_light: '#5b00ff',
  accent_dark: '#dba5ef',
})

export const gin_green = createTheme({
  title: '绿色',
  name: 'gin_green',
  accent_light: '#00875f',
  accent_dark: '#6bd4a1',
})

export const gin_teal = createTheme({
  title: '蓝绿色',
  name: 'gin_teal',
  accent_light: '#10857f',
  accent_dark: '#00ead0',
})
export const gin_red = createTheme({
  title: '红色',
  name: 'gin_red',
  accent_light: '#d8002f',
  accent_dark: '#ec8989',
})
export const gin_orange = createTheme({
  title: '橙色',
  name: 'gin_orange',
  accent_light: '#ef5c20',
  accent_dark: '#f79576',
})
export const gin_yellow = createTheme({
  title: '黄色',
  name: 'gin_yellow',
  accent_light: '#c58900',
  accent_dark: '#f1c970',
})
export const gin_pink = createTheme({
  title: '粉色',
  name: 'gin_pink',
  accent_light: '#e23177',
  accent_dark: '#e79da3',
})
