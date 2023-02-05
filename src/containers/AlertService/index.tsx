/*global Proxy */
import {
  createContext,
  forwardRef,
  ReactNode,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import DropdownAlert from 'react-native-dropdownalert'

import { useTheme } from '../ThemeService'
const AlertService = createContext<Partial<DropdownAlert>>({})

const AlertServiceProvider = forwardRef<
  Partial<DropdownAlert>,
  {
    children: ReactNode
  }
>((props, ref) => {
  const { theme } = useTheme()
  const innerRef = useRef<DropdownAlert>(null)

  const service: Partial<DropdownAlert> = useMemo(() => {
    return new Proxy(
      {},
      {
        get: function (_, prop) {
          if (innerRef.current) {
            return innerRef.current[prop]
          }
          if (typeof prop !== 'symbol') {
            if (prop === 'alertWithType') {
              return () => {
                console.warn('alert service instance not ref...')
              }
            }
          }
          return null
        },
      },
    )
  }, [])

  useImperativeHandle(ref, () => service, [])

  return (
    <AlertService.Provider value={service}>
      {props.children}
      <DropdownAlert
        ref={innerRef}
        renderImage={() => null}
        closeInterval={2500}
        defaultContainer={{
          paddingHorizontal: 6,
        }}
        defaultTextContainer={{
          paddingTop: 6,
          paddingHorizontal: 6,
          paddingBottom: 8,
        }}
        titleStyle={{
          fontSize: 16,
          textAlign: 'left',
          fontWeight: 'bold',
          color: theme.colors.white,
          backgroundColor: 'transparent',
          marginBottom: 2,
        }}
        successColor={theme.colors.success}
        errorColor={theme.colors.danger}
        infoColor={theme.colors.info}
      />
    </AlertService.Provider>
  )
})
AlertServiceProvider.displayName = 'AlertServiceProvider'

export default AlertServiceProvider

export const useAlertService = () => useContext(AlertService)
