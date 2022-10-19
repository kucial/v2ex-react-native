import { useMemo } from 'react'
import { Text } from 'react-native'
import TimeAgo from 'javascript-time-ago'
import zh from 'javascript-time-ago/locale/zh.json'

TimeAgo.addDefaultLocale(zh)
const timeAgo = new TimeAgo('zh')

export default function RTimeAgo(props) {
  const value = useMemo(() => {
    return timeAgo.format(new Date(props.date))
  }, [props.date])
  return <Text>{value}</Text>
}
