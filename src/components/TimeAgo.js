import { StyleSheet, Text, View } from 'react-native'
import { useMemo } from 'react'
import TimeAgo from 'javascript-time-ago'
import zh from 'javascript-time-ago/locale/zh.json'

import React from 'react'

TimeAgo.addDefaultLocale(zh)
const timeAgo = new TimeAgo('zh')

export default function RTimeAgo(props) {
  const value = useMemo(() => {
    return timeAgo.format(new Date(props.date))
  }, [props.date])
  return <Text>{value}</Text>
}
