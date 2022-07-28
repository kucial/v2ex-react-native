import { View, Text } from 'react-native'
import React, { useMemo } from 'react'
import { useTailwind } from 'tailwindcss-react-native'

const randomPercentage = () => {
  return (Math.max(0.3, Math.random()) * 100).toFixed() + '%'
}

const valueInRange = (range) => {
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
        ...next
      }),
      {}
    )
  } else {
    merged = style || {}
  }
  return merged[key]
}

export function InlineText(props) {
  const tw = useTailwind()
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
      style={{
        ...tw('flex flex-row items-center'),
        height: getStyleValue(props.style, 'lineHeight') || 24,
        width
      }}>
      <View
        style={[
          tw(`${textColor ? '' : 'bg-gray-100'} rounded w-full animate-pulse`),
          {
            height: getStyleValue(props.style, 'fontSize') || 16
          },
          textColor && {
            backgroundColor: textColor
          }
        ]}
      />
    </View>
  )
}

export function BlockText(props) {
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
