import {
  createContext,
  forwardRef,
  ReactNode,
  useContext,
  useImperativeHandle,
  useMemo,
} from 'react'
import Toast from 'react-native-root-toast'

import { useTheme } from '../ThemeService'
const AlertServiceContext = createContext<Partial<AlertService>>({})
import { AlertService } from './types'

const AlertServiceProvider = forwardRef<
  Partial<AlertService>,
  {
    children: ReactNode
  }
>((props, ref) => {
  const { getSemanticStyle, styles } = useTheme()
  const service = useMemo(() => {
    const s = {
      alertWithType({ type, message, ...options }) {
        const [bgStyle, textStyle] = getSemanticStyle(type)
        const sibling = Toast.show(message, {
          opacity: 0.9,
          shadow: false,
          position: -110,
          containerStyle: [
            bgStyle,
            {
              borderRadius: 24,
              paddingHorizontal: 16,
            },
            styles.shadow_light,
          ],
          textStyle,
          onHidden() {
            sibling.manager.destroy()
          },
          ...options,
        })
        return sibling
      },
    } as AlertService

    return s
  }, [getSemanticStyle])

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
