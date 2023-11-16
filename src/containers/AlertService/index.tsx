import {
  createContext,
  forwardRef,
  ReactNode,
  useContext,
  useImperativeHandle,
  useMemo,
} from 'react'
import Toast from 'react-native-root-toast'

import Loader from '@/components/Loader'

import { getSemanticStyle, useTheme } from '../ThemeService'
const AlertServiceContext = createContext<Partial<AlertService>>({})
import { AlertService } from './types'

const AlertServiceProvider = forwardRef<
  Partial<AlertService>,
  {
    children: ReactNode
  }
>((props, ref) => {
  const { styles } = useTheme()
  const service = useMemo(() => {
    const s = {
      show({ type, message, loading, ...options }) {
        const [bgStyle, textStyle] = getSemanticStyle(type, styles)
        const sibling = Toast.show(message, {
          shadow: false,
          position: -110,
          loader: loading ? (
            <Loader
              size={16}
              color={textStyle.color as string}
              style={{ marginRight: 8, marginLeft: -1 }}
            />
          ) : null,
          containerStyle: [bgStyle, styles.shadow_light],
          duration: type === 'success' ? 1500 : 2000,
          textStyle,
          onHidden() {
            Toast.hide(sibling)
          },
          ...options,
        })
        return sibling
      },
      hide(toast) {
        Toast.hide(toast)
      },
    } as AlertService

    return s
  }, [styles])

  useImperativeHandle(ref, () => service, [])

  return (
    <AlertServiceContext.Provider value={service}>
      {props.children}
    </AlertServiceContext.Provider>
  )
})
AlertServiceProvider.displayName = 'AlertServiceProvider'

export default AlertServiceProvider

export const useAlertService = () => useContext(AlertServiceContext)
