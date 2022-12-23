/*global Proxy */
import { createContext, useContext, useMemo, useRef } from 'react'
import DropdownAlert from 'react-native-dropdownalert'
import colors from 'tailwindcss/colors'

import { useTheme } from './ThemeService'
const AlterService = createContext()

export default function AlertService(props) {
  const { theme } = useTheme()
  const ref = useRef()

  const service = useMemo(() => {
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
    <AlterService.Provider value={service}>
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
          color: 'white',
          backgroundColor: 'transparent',
          marginBottom: 2,
        }}
        successColor={theme.colors.success}
        errorColor={theme.colors.danger}
        infoColor={theme.colors.info}
      />
    </AlterService.Provider>
  )
}

export const useAlertService = () => useContext(AlterService)
