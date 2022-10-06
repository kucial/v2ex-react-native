import React from 'react'
import { createContext } from 'react'
import { useMemo } from 'react'
import { Text, View } from 'react-native'

const FooterRegionContext = createContext()

export default function FooterRegion(props) {
  const [compoStack, setCompoStack] = useState(new Map())
  const service = useMemo(() => {})
  return (
    <FooterRegionContext.Provider value={service}>
      <View style={{ flex: 1 }}>{props.children}</View>
    </FooterRegionContext.Provider>
  )
}
