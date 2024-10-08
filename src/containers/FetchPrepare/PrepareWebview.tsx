import { useCallback, useEffect, useRef } from 'react'
import { Platform, View, ViewStyle } from 'react-native'
import WebView from 'react-native-webview'
import * as Sentry from '@sentry/react-native'

import {
  BASE_URL,
  USER_AGENT_ANDROID,
  USER_AGENT_IOS,
} from '@/utils/v2ex-client/constants'

import { PrepareStatus } from './type'

const USER_AGENT =
  Platform.select({
    ios: USER_AGENT_IOS,
    android: USER_AGENT_ANDROID,
  }) || USER_AGENT_IOS
/**
 * 场景一： 不需要 CF 验证
 *
 * - /about
 *
 * 场景二： CF 验证，并自动通过
 *
 * - /about
 * - /about?__cf_chl_rt_tk=xxx
 * - /about checking
 * - /about?__cf_chl_tk=xxx
 *
 * 场景三： CF 验证，并需要手动处理
 *
 * - /about
 * - /about?__cf_chl_rt_tk=xxx
 * - /about
 * - /about (interation_required)
 * - /about?__cf_chl_tk=xxx
 */

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
    if (e.nativeEvent.description !== 'The request timed out.') {
      Sentry.captureException(error)
    }
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
        onLoadStart={(e) => {
          if (Platform.OS == 'android') {
            if (/__cf_chl_tk/.test(e.nativeEvent.url)) {
              cfState.current = 'checked_loading'
              props.onUpdate('checked_loading')
              return
            }
            if (/__cf_chl_rt_tk/.test(e.nativeEvent.url)) {
              cfState.current = 'checking'
              props.onUpdate('checking')
              return
            }
            if (cfState.current === 'checking') {
              timeoutRef.current = setTimeout(() => {
                props.onUpdate('interation_required')
              }, 5000)
              return
            }
          }
        }}
        onLoad={(e) => {
          clearTimeout(timeoutRef.current)
          console.log(
            'PrepareWebview onLoad',
            e.nativeEvent.url,
            e.nativeEvent.mainDocumentURL,
            cfState.current,
          )
          if (Platform.OS == 'ios') {
            // Next: check content instead of checking url
            if (/__cf_chl_tk/.test(e.nativeEvent.url)) {
              cfState.current = 'checked'
              props.onUpdate('checked')
              return
            }
            if (/__cf_chl_rt_tk/.test(e.nativeEvent.url)) {
              cfState.current = 'checking'
              props.onUpdate('checking')
              return
            }
            if (cfState.current === 'checking') {
              timeoutRef.current = setTimeout(() => {
                props.onUpdate('interation_required')
              }, 5000)
              return
            }
          }

          if (
            Platform.OS == 'android' &&
            cfState.current == 'checked_loading'
          ) {
            cfState.current = 'checked'
            props.onUpdate('checked')
            return
          }

          if (
            cfState.current === 'interation_required' ||
            cfState.current === 'error'
          ) {
            return
          }

          const duration = Date.now() - timerRef.current
          Sentry.addBreadcrumb({
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
