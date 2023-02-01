import {
  createContext,
  ReactElement,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useWindowDimensions, View } from 'react-native'

import Loader from '@/components/Loader'

import { useTheme } from '../ThemeService'

type Context = {
  show(keys: string): void
  hide(keys: string): void
}
const ActivityIndicatorContext = createContext<Context>(null)

const INDICATOR_WIDTH = 64
const INDICATOR_HEIGHT = 64
const LOADING_SET = new Set()

export default function ActivityIndicatorProvider(props: {
  children: ReactElement
}) {
  const [, setCount] = useState(0)
  const { width, height } = useWindowDimensions()
  const { theme } = useTheme()

  const service = useMemo(
    () => ({
      show: (key: string) => {
        const size = LOADING_SET.size
        LOADING_SET.add(key)
        if (LOADING_SET.size !== size) {
          setCount((prev) => prev + 1)
        }
      },
      hide: (key: string) => {
        const size = LOADING_SET.size
        LOADING_SET.delete(key)
        if (LOADING_SET.size !== size) {
          setCount((prev) => prev + 1)
        }
      },
    }),
    [],
  )

  return (
    <ActivityIndicatorContext.Provider value={service}>
      {props.children}
      {!!LOADING_SET.size && (
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
            backgroundColor: theme.colors.bg_layer3,
            opacity: 80,
          }}>
          <Loader size={30} color={theme.colors.primary} autoPlay />
        </View>
      )}
    </ActivityIndicatorContext.Provider>
  )
}

export const useActivityIndicator = () => useContext(ActivityIndicatorContext)
