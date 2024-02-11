import { useCallback, useEffect, useRef } from 'react'
import { View, ViewStyle } from 'react-native'
import WebView from 'react-native-webview'
import * as Sentry from 'sentry-expo'

import { BASE_URL, USER_AGENT } from '@/utils/v2ex-client/constants'

import { PrepareStatus } from './type'

export default function PrepareWebview(props: {
  onUpdate(status: PrepareStatus, err?: Error): void
  visible?: boolean
  containerStyle?: ViewStyle[] | ViewStyle
}) {
  const timerRef = useRef<number>(Date.now())
  const timeoutRef = useRef(null)
  const cfState = useRef<PrepareStatus>('none')

  const handleError = useCallback((e) => {
    if (cfState.current == 'none') {
      return
    }
    const error = new Error(e.nativeEvent.description)
    Sentry.Native.captureException(error)
    cfState.current = 'error'
    props.onUpdate('error', error)
  }, [])

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      cfState.current = 'error'
      props.onUpdate('error', new Error('网络超时，请检查网络连接。'))
    }, 15000)
    return () => {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <View style={props.visible ? props.containerStyle : { height: 0 }}>
      <WebView
        source={{
          uri: BASE_URL + '/about',
        }}
        userAgent={USER_AGENT}
        originWhitelist={['*']}
        sharedCookiesEnabled={true}
        onLoad={(e) => {
          clearTimeout(timeoutRef.current)
          console.log('PrepareWebview', e.nativeEvent.url, cfState.current)
          // Next: check content instead of checking url
          if (/__cf_chl_tk/.test(e.nativeEvent.url)) {
            cfState.current = 'checked'
            props.onUpdate('checked')
            return
          }
          if (/__cf_chl_rt_tk/.test(e.nativeEvent.url)) {
            cfState.current = 'checking'
            props.onUpdate('checking')
            timeoutRef.current = setTimeout(() => {
              props.onUpdate('checking_timeout')
            }, 15000)
            return
          }
          if (cfState.current === 'checking' || cfState.current === 'error') {
            return
          }

          const duration = Date.now() - timerRef.current
          Sentry.Native.addBreadcrumb({
            level: 'info',
            category: 'fetch-prepare',
            message: 'fetch-prepare-webview load duration: ',
            data: {
              duration,
            },
          })
          props.onUpdate('ready')
        }}
        onError={handleError}
        onHttpError={(e) => {
          console.log('HTTP Error', e.nativeEvent.statusCode)
        }}
      />
    </View>
  )
}
