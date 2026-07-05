import { useMemo } from 'react'
import { Text } from 'react-native'

import { formatTimeAgo } from '@/utils/time'

export default function RTimeAgo(props: { date: number | string | Date }) {
  const value = useMemo(() => {
    return formatTimeAgo(props.date)
  }, [props.date])
  return <Text>{value}</Text>
}
