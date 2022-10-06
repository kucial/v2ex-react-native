import React, { createContext, useContext, useMemo, useRef } from 'react'
import DropdownAlert from 'react-native-dropdownalert'
import colors from 'tailwindcss/colors'
import { useColorScheme } from 'tailwindcss-react-native'
const AlterService = createContext()

export default function AlertService(props) {
  const ref = useRef()
  const { colorScheme } = useColorScheme()
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
        }
      }
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
          paddingHorizontal: 6
        }}
        defaultTextContainer={{
          paddingTop: 6,
          paddingHorizontal: 6,
          paddingBottom: 8
        }}
        titleStyle={{
          fontSize: 16,
          textAlign: 'left',
          fontWeight: 'bold',
          color: 'white',
          backgroundColor: 'transparent',
          marginBottom: 2
        }}
        successColor={colorScheme === 'dark' ? colors.emerald[400] : undefined}
        errorColor={colorScheme === 'dark' ? colors.rose[600] : undefined}
        infoColor={colorScheme === 'dark' ? colors.cyan[500] : undefined}
      />
    </AlterService.Provider>
  )
}

export const useAlertService = () => useContext(AlterService)
