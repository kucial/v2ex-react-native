import { ReactNode, useMemo } from 'react'
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'

import { useTheme } from '@/containers/ThemeService'

const randomPercentage = () => {
  return (Math.max(0.3, Math.random()) * 100).toFixed() + '%'
}

export const valueInRange = (range) => {
  const [min, max] = range
  const delta = max - min
  return min + Math.random() * delta
}

const getStyleValue = (style, key) => {
  let merged
  if (Array.isArray(style)) {
    merged = style.reduce(
      (m, next) => ({
        ...m,
        ...next,
      }),
      {},
    )
  } else {
    merged = style || {}
  }
  return merged[key]
}

export function InlineText(props: {
  width?: number | number[] | string | string[]
  randomWidth?: boolean
  style?: StyleProp<TextStyle>
}) {
  const { theme } = useTheme()
  const width = useMemo(() => {
    if (Array.isArray(props.width)) {
      return valueInRange(props.width)
    }
    if (props.width) {
      return props.width
    }
    if (props.randomWidth) {
      return randomPercentage()
    }
    return '100%'
  }, [props.width, props.randomWidth])

  const textColor = getStyleValue(props.style, 'color')

  return (
    <View
      style={[
        elemStyles.inlineTextContainer,
        {
          height: getStyleValue(props.style, 'lineHeight') || 24,
          width,
        },
      ]}
    >
      <View
        style={[
          elemStyles.roundedFullWidth,
          {
            height: getStyleValue(props.style, 'fontSize') || 16,
            backgroundColor: textColor || theme.colors.skeleton,
          },
        ]}
      />
    </View>
  )
}

export function BlockText(props: {
  lines: number | number[]
  style?: StyleProp<ViewStyle & TextStyle>
}) {
  const lines = useMemo(() => {
    if (Array.isArray(props.lines)) {
      return Math.round(valueInRange(props.lines))
    }
    return props.lines
  }, [props.lines])

  return (
    <View>
      {lines > 1 &&
        [...new Array(lines - 1)].map((_, index) => (
          <InlineText style={props.style} key={index} />
        ))}
      <InlineText style={props.style} randomWidth key={lines - 1} />
    </View>
  )
}

export function InlineBox(props: {
  width?: number | number[] | string | string[]
  style?: StyleProp<ViewStyle>
}) {
  const { theme } = useTheme()
  const width = useMemo(() => {
    if (Array.isArray(props.width)) {
      return valueInRange(props.width)
    }
    if (props.width) {
      return props.width
    }
  }, [props.width])
  return (
    <View
      style={[
        props.style,
        width && { width: width as any },
        {
          backgroundColor: theme.colors.skeleton,
        },
      ]}
    >
      <Text> </Text>
    </View>
  )
}

export function Box(props: {
  style?: StyleProp<ViewStyle>
  children?: ReactNode
}) {
  const { theme } = useTheme()
  return (
    <View
      style={[
        props.style,
        {
          backgroundColor: theme.colors.skeleton,
        },
      ]}
    >
      {props.children}
    </View>
  )
}

const elemStyles = StyleSheet.create({
  inlineTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roundedFullWidth: {
    borderRadius: 4,
    width: '100%',
  },
})
