import { useMemo } from 'react'
import { Text, TextStyle } from 'react-native'
import { styled } from 'nativewind'
import useSWR from 'swr'

import { getNodes } from '@/utils/v2ex-client'

function NodeLabel(props: { id?: number; name?: string; style: TextStyle }) {
  const nodesSwr = useSWR('/api/nodes/all.json', getNodes, {
    revalidateOnMount: false,
    revalidateOnFocus: false,
  })
  const { name, id } = props
  const node = useMemo(() => {
    if (!nodesSwr.data) {
      return null
    }
    if (!name && !id) {
      return null
    }
    if (name) {
      return nodesSwr.data.data.find((item) => item.name === name)
    }
    return nodesSwr.data.data.find((item) => item.id === id)
  }, [name, id, nodesSwr.data])
  if (!node) {
    return null
  }

  return <Text style={props.style}>{node.title}</Text>
}

export default styled(NodeLabel)
