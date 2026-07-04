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
import { AlertService } from './types'
const AlertServiceContext = createContext<Partial<AlertService>>({})

type ToastOptionsWithLoader = NonNullable<Parameters<typeof Toast.show>[1]> & {
  loader?: ReactNode
}

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
        const { container: containerStyle, text: textStyle } = getSemanticStyle(
          type,
          styles,
        )
        const activeTextStyle = textStyle ?? styles.text
        const toastOptions: ToastOptionsWithLoader = {
          shadow: false,
          position: -110,
          loader: loading ? (
            <Loader
              size={16}
              color={
                typeof activeTextStyle.color === 'string'
                  ? activeTextStyle.color
                  : undefined
              }
              style={{ marginRight: 8, marginLeft: -1 }}
            />
          ) : null,
          containerStyle: [containerStyle, styles.shadow_light],
          duration: type === 'success' ? 1500 : 2000,
          textStyle: activeTextStyle,
          onHidden() {
            Toast.hide(sibling)
          },
          ...options,
        }
        const sibling = Toast.show(message, toastOptions)
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

export const useAlertService = () =>
  useContext(AlertServiceContext) as AlertService
