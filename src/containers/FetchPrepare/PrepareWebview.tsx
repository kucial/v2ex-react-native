import { useCallback, useRef } from 'react'
import { View } from 'react-native'
import WebView from 'react-native-webview'
import * as Sentry from 'sentry-expo'

import { BASE_URL, USER_AGENT } from '@/utils/v2ex-client/constants'

export default function PrepareWebview(props: {
  onReady(): void
  onError(err: Error): void
}) {
  const timerRef = useRef<number>(null)
  const cfState = useRef(null)

  const handleError = useCallback((e) => {
    const error = new Error(e.nativeEvent.description)
    Sentry.Native.captureException(error)
    props.onError(error)
  }, [])

  return (
    <View style={{ height: 0 }}>
      <WebView
        source={{
          uri: BASE_URL + '/about',
        }}
        userAgent={USER_AGENT}
        originWhitelist={['*']}
        sharedCookiesEnabled={true}
        onLoad={(e) => {
          const duration = Date.now() - timerRef.current
          console.log(e.nativeEvent.url, cfState.current)
          if (/__cf_chl_tk/.test(e.nativeEvent.url)) {
            cfState.current = 'checked'

            return
          }
          if (/__cf_chl_rt_tk/.test(e.nativeEvent.url)) {
            cfState.current = 'checking'
            return
          }
          if (cfState.current === 'checking') {
            return
          }

          Sentry.Native.addBreadcrumb({
            level: 'info',
            category: 'fetch-prepare',
            message: 'fetch-prepare-webview load duration: ',
            data: {
              duration,
            },
          })
          props.onReady()
        }}
        onError={handleError}
        onHttpError={handleError}
      />
    </View>
  )
}
