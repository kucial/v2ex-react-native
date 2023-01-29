import { View, AppState } from 'react-native'
import { useEffect, useRef } from 'react'
import WebView from 'react-native-webview'
import * as Sentry from 'sentry-expo'

import ApiError from './ApiError'
import { BASE_URL, USER_AGENT } from './constants'

import service from './service'

const shouldReload = (timestamp: number) => {
  return timestamp && Date.now() - timestamp > 1000 * 60 * 60 // 1 小时
}

// TODO ... Make Client Webview an Event Dispatcher...

export default function V2exClientWebView() {
  const ref = useRef<WebView>(null)
  const timerRef = useRef<number>(null)
  const promiseCallback = useRef(null)
  const readyTimeout = useRef(null)

  useEffect(() => {
    service.webview = ref.current
    return () => {
      service.webview = null
      service.isReady = false
      if (readyTimeout.current) {
        clearTimeout(readyTimeout.current)
      }
    }
  }, [])

  // refresh service when recovery from background....
  useEffect(() => {
    let appState = AppState.currentState
    let moveToBackgroundTimestamp: number
    const subscription = AppState.addEventListener(
      'change',
      function (nextAppState) {
        if (
          appState === 'background' &&
          nextAppState === 'active' &&
          shouldReload(moveToBackgroundTimestamp)
        ) {
          Sentry.Native.addBreadcrumb({
            type: 'info',
            category: 'v2ex-client',
            message: 'Reload webview when appState [background] ==> [active]',
          })
          service.reload(true)
        } else if (nextAppState === 'background') {
          moveToBackgroundTimestamp = Date.now()
        }
        appState = nextAppState
      },
    )
    return () => {
      subscription.remove()
    }
  }, [])

  return (
    <View style={{ height: 0 }}>
      <WebView
        ref={ref}
        source={{ uri: BASE_URL }}
        userAgent={USER_AGENT}
        originWhitelist={['*']}
        onLoadStart={() => {
          timerRef.current = Date.now()
          readyTimeout.current = setTimeout(() => {
            if (!service.isReady) {
              service.isReady = true
              promiseCallback.current?.resolve()
            }
            readyTimeout.current = null
          }, 1500)
        }}
        onLoad={() => {
          const duration = Date.now() - timerRef.current
          Sentry.Native.addBreadcrumb({
            level: 'info',
            category: 'v2ex-client',
            data: {
              webviewLoadDuration: duration,
            },
          })
          console.log('v2ex-client-webview load duration: ', duration)
          service.isReady = true
          promiseCallback.current?.resolve()
        }}
        onMessage={service.handleMessage}
        onError={(e) => {
          service.error = new ApiError({
            code: `Error ${e.nativeEvent.code}`,
            message: e.nativeEvent.description,
          })
          promiseCallback.current?.reject(service.error)
        }}
        onHttpError={(e) => {
          service.error = new ApiError({
            code: `Http Error ${e.nativeEvent.statusCode}`,
            message: e.nativeEvent.description,
          })
          promiseCallback.current?.reject(service.error)
        }}
      />
    </View>
  )
}
