import React, { createContext, useContext, useMemo, useRef } from 'react'
import DropdownAlert from 'react-native-dropdownalert'
const AlterService = createContext()

export default function AlertService(props) {
  const ref = useRef()
  const service = useMemo(() => {
    return new Proxy(
      {},
      {
        get: function (_, prop) {
          if (ref.current) {
            return ref.current[prop]
          }
          console.warn('alert service instance not ref...')
          return null
        }
      }
    )
  }, [])
  return (
    <AlterService.Provider value={service}>
      {props.children}
      <DropdownAlert ref={ref} />
    </AlterService.Provider>
  )
}

export const useAlertService = () => useContext(AlterService)
