import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SENTRY_DSN } from '@env'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import * as Sentry from 'sentry-expo'
import { SWRConfig } from 'swr'

import ErrorBoundary from './src/components/ErrorBoundary'
import ActivityIndicator from './src/containers/ActivityIndicator'
import AlertService from './src/containers/AlertService'
import AppSettingsService from './src/containers/AppSettingsService'
import AuthService from './src/containers/AuthService'
import ImgurService from './src/containers/ImgurService'
import NavigationContainer from './src/containers/NavigationContainer'
import { ThemeProvider } from './src/containers/ThemeService'
import ViewedTopicsService from './src/containers/ViewedTopicsService'
import AppStack from './src/screens/AppStack'
// import DebugScreen from './src/screens/DebugScreen'
import fetcher, { FetcherWebView } from './src/utils/fetcher'
import { cacheProvider } from './src/utils/swr'

Sentry.init({
  dsn: SENTRY_DSN,
  enableInExpoDevelopment: false,
  debug: false,
  tracesSampleRate: 1.0,
})

const swrConfig = {
  fetcher: fetcher,
  provider: cacheProvider,
  onError(err, key, config) {
    if (err instanceof Error) {
      // err with custom code consider handled
      if (!err.code) {
        Sentry.Native.captureException(err, {
          extra: {
            key,
            config,
            info: err.data,
          },
        })
      }
    } else {
      Sentry.Native.addBreadcrumb({
        type: 'info',
        data: { swrKey: key, err, message: err?.message },
      })
      Sentry.Native.captureMessage('SWR_ERROR_@')
    }
  },
  // isOnline() {
  //   return true
  // },
  // isVisible() {
  //   return true
  // },
  // initFocus(callback) {
  //   let appState = AppState.currentState

  //   const onAppStateChange = (nextAppState) => {
  //     /* If it's resuming from background or inactive mode to active one */
  //     if (appState.match(/inactive|background/) && nextAppState === 'active') {
  //       callback()
  //     }
  //     appState = nextAppState
  //   }

  //   // Subscribe to the app state change events
  //   const subscription = AppState.addEventListener('change', onAppStateChange)

  //   return () => {
  //     subscription.remove()
  //   }
  // },
  // initReconnect(callback) {
  //   let netState
  //   NetInfo.fetch().then((state) => {
  //     if (state.isConnected) {
  //       callback()
  //     }
  //     netState = state
  //   })
  //   const onNetworkChange = NetInfo.addEventListener((nextNetState) => {
  //     if (!netState?.isConnected && nextNetState.isConnected) {
  //       callback()
  //     }
  //     netState = nextNetState
  //   })

  //   const unsubscribe = NetInfo.addEventListener(onNetworkChange)

  //   return () => {
  //     unsubscribe()
  //   }
  // }
  // refreshInterval: 5 * 60 * 1000 // 5min
}

function App() {
  return (
    <AppSettingsService>
      <ThemeProvider>
        <FetcherWebView />
        <ErrorBoundary>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SWRConfig value={swrConfig}>
              <AlertService>
                <ActionSheetProvider>
                  <ActivityIndicator>
                    <NavigationContainer>
                      <ImgurService>
                        <BottomSheetModalProvider>
                          <AuthService>
                            <ViewedTopicsService>
                              {/* <DebugScreen /> */}
                              <AppStack />
                            </ViewedTopicsService>
                          </AuthService>
                        </BottomSheetModalProvider>
                      </ImgurService>
                    </NavigationContainer>
                  </ActivityIndicator>
                </ActionSheetProvider>
              </AlertService>
            </SWRConfig>
          </GestureHandlerRootView>
        </ErrorBoundary>
      </ThemeProvider>
    </AppSettingsService>
  )
}

export default App
