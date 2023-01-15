/*global Proxy */
import { createContext, ReactNode, useContext, useRef, useMemo } from 'react'
import DropdownAlert from 'react-native-dropdownalert'

import { useTheme } from '../ThemeService'
const AlertService = createContext<Partial<DropdownAlert>>({})

export default function AlertServiceProvider(props: { children: ReactNode }) {
  const { theme } = useTheme()
  const ref = useRef<DropdownAlert>(null)

  const service: Partial<DropdownAlert> = useMemo(() => {
    return new Proxy(
      {},
      {
        get: function (_, prop) {
          if (ref.current) {
            return ref.current[prop]
          }
          if (typeof prop !== 'symbol') {
            console.warn('alert service instance not ref...')
          }
          return null
        },
      },
    )
  }, [])

  return (
    <AlertService.Provider value={service}>
      {props.children}
      <DropdownAlert
        ref={ref}
        renderImage={() => null}
        closeInterval={3000}
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
}

export const useAlertService = () => useContext(AlertService)
