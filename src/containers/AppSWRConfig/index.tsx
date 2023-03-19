import { PropsWithChildren, useCallback, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import NetInfo from '@react-native-community/netinfo'
import * as Sentry from 'sentry-expo'
import { SWRConfig } from 'swr'
import { stableHash } from 'swr/_internal'

import { cacheProvider } from '@/utils/swr'
import ApiError from '@/utils/v2ex-client/ApiError'

function AppSWRConfig(props: PropsWithChildren) {
  return (
    <SWRConfig
      value={{
        provider: cacheProvider,
        errorRetryInterval: 1000 * 20,
        errorRetryCount: 3,
        revalidateIfStale: false,
        // revalidateOnMount: false,
        isOnline() {
          return true
        },
        isVisible() {
          return true
        },
        initFocus(callback) {
          let appState = AppState.currentState

          const onAppStateChange = (nextAppState: AppStateStatus) => {
            /* If it's resuming from background or inactive mode to active one */
            if (
              appState.match(/inactive|background/) &&
              nextAppState === 'active'
            ) {
              callback()
            }
            appState = nextAppState
          }

          // Subscribe to the app state change events
          const subscription = AppState.addEventListener(
            'change',
            onAppStateChange,
          )

          return () => {
            subscription.remove()
          }
        },
        initReconnect(callback) {
          const unsubscribe = NetInfo.addEventListener((state) => {
            if (state.isConnected) {
              callback()
            }
          })
          return unsubscribe
        },
        onError(err, key, config) {
          if (err instanceof Error && !(err instanceof ApiError)) {
            // err with custom code consider handled
            Sentry.Native.captureException(err, {
              extra: {
                key,
                config,
              },
            })
          } else {
            Sentry.Native.addBreadcrumb({
              type: 'info',
              message: 'swr info',
              data: { swrKey: key, err },
            })
            Sentry.Native.captureMessage('@_SWR_ERROR_@')
          }
        },
        onLoadingSlow(key, config) {
          Sentry.Native.addBreadcrumb({
            type: 'info',
            message: 'swr info',
            data: { slowKey: key },
          })
          Sentry.Native.captureMessage('@_LOADING_SLOW_@')
        },
        compare(a, b) {
          if (
            typeof a === 'object' &&
            typeof b === 'object' &&
            a.data &&
            b.data
          ) {
            return stableHash(a.data) === stableHash(b.data)
          }
          return stableHash(a) === stableHash(b)
        },
        onErrorRetry(err, key, config, revalidate, { retryCount }) {
          if (err.code === '2FA_ENABLED') {
            return
          }
          if (err.code !== 'CLIENT_TIMEOUT') {
            setTimeout(() => revalidate({ retryCount }), 5000)
          }
          return
        },
      }}>
      {props.children}
    </SWRConfig>
  )
}

export default AppSWRConfig
