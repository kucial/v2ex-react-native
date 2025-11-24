import { ReactNode, useMemo } from 'react'
import { Text, TextStyle, View, ViewStyle } from 'react-native'
import { cssInterop } from 'react-native-css-interop'

import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'

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

function InnerInlineText(props: {
  width?: number | number[] | string | string[]
  randomWidth?: boolean
  style?: TextStyle
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
      className='flex flex-row items-center'
      style={{
        height: getStyleValue(props.style, 'lineHeight') || 24,
        width,
      }}
    >
      <View
        className='rounded w-full animate-pulse'
        style={[
          {
            height: getStyleValue(props.style, 'fontSize') || 16,
            backgroundColor: textColor || theme.colors.skeleton,
          },
        ]}
      />
    </View>
  )
}

export const InlineText = cssInterop(InnerInlineText, {
  className: {
    target: 'style',
  },
})

export function BlockText(props: {
  lines: number | number[]
  style?: ViewStyle & TextStyle
  className?: string
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
          <InlineText
            style={props.style}
            className={props.className}
            key={index}
          />
        ))}
      <InlineText
        style={props.style}
        className={props.className}
        randomWidth
        key={lines - 1}
      />
    </View>
  )
}

function InnerInlineBox(props: {
  width?: number | number[] | string | string[]
  style?: ViewStyle
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
      className='animate-pulse'
      style={[
        props.style,
        width && { width },
        {
          backgroundColor: theme.colors.skeleton,
        },
      ]}
    >
      <Text> </Text>
    </View>
  )
}

export const InlineBox = cssInterop(InnerInlineBox, {
  className: 'style',
})

function InnerBox(props: {
  className?: string
  style?: ViewStyle | ViewStyle[]
  children?: ReactNode
}) {
  const { theme } = useTheme()
  return (
    <View
      className='animate-pulse'
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

export const Box = cssInterop(InnerBox, {
  className: 'style',
})
