import { createContext, useContext, useMemo, useState } from 'react'
import { useWindowDimensions, View } from 'react-native'

import Loader from '@/components/Loader'

const ActivityIndicatorContext = createContext({
  show: () => {},
  hide: () => {},
})

const INDICATOR_WIDTH = 64
const INDICATOR_HEIGHT = 64
export default function ActivityIndicatorProvider(props) {
  const [visible, setVisible] = useState(false)
  const { width, height } = useWindowDimensions()

  const service = useMemo(() => ({
    show: () => setVisible(true),
    hide: () => setVisible(false),
  }))

  return (
    <ActivityIndicatorContext.Provider value={service}>
      {props.children}
      {visible && (
        <View
          style={{
            position: 'absolute',
            left: (width - INDICATOR_WIDTH) / 2,
            top: (height - INDICATOR_WIDTH) / 2,
            width: INDICATOR_WIDTH,
            height: INDICATOR_HEIGHT,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
          }}
          className="bg-neutral-100/80 dark:bg-neutral-900/90">
          <Loader size={30} color="#333" autoPlay />
        </View>
      )}
    </ActivityIndicatorContext.Provider>
  )
}

export const useActivityIndicator = () => useContext(ActivityIndicatorContext)
