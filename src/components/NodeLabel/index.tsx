import { useMemo } from 'react'
import { Text, TextStyle } from 'react-native'
import { useQuery } from '@tanstack/react-query'

import { getNodes } from '@/utils/v2ex-client'

function NodeLabel(props: {
  id?: number
  name?: string
  style?: TextStyle | TextStyle[]
}) {
  const nodesQuery = useQuery({
    queryKey: ['/api/nodes/all.json'],
    queryFn: getNodes,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const { name, id } = props
  const node = useMemo(() => {
    if (!nodesQuery.data) {
      return null
    }
    if (!name && !id) {
      return null
    }
    if (name) {
      return nodesQuery.data.data.find((item) => item.name === name)
    }
    return nodesQuery.data.data.find((item) => item.id === id)
  }, [name, id, nodesQuery.data])
  if (!node) {
    return null
  }

  return <Text style={props.style}>{node.title}</Text>
}

export default NodeLabel
