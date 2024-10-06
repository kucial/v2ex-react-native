import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { RootSiblingParent } from 'react-native-root-siblings'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { SENTRY_DSN } from '@env'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import * as Sentry from '@sentry/react-native'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Updates from 'expo-updates'

import ErrorBoundary from './src/components/ErrorBoundary'
import Layout from './src/components/Layout'
import AlertService from './src/containers/AlertService'
import AppSettingsService from './src/containers/AppSettingsService'
import AppSWRConfig from './src/containers/AppSWRConfig'
import AuthService from './src/containers/AuthService'
import ClipboardWatcher from './src/containers/ClipboardWatcher'
import FetchPrepare from './src/containers/FetchPrepare'
import ImgurService from './src/containers/ImgurService'
import NavigationContainer from './src/containers/NavigationContainer'
import NotificationService from './src/containers/NotificationService'
import { getThemeService, ThemeProvider } from './src/containers/ThemeService'
import ViewedTopicsService from './src/containers/ViewedTopicsService'
import AppStack from './src/screens/AppStack'
// import DebugScreen from './src/screens/DebugScreen'

Sentry.init({
  dsn: SENTRY_DSN,
  enabled: !__DEV__,
  debug: false,
  tracesSampleRate: 1.0,
})

Sentry.setExtras({
  manifest: Updates.manifest,
  deviceYearClass: Device.deviceYearClass,
  linkingUri: Constants.linkingUri,
})

Sentry.setTag('expoReleaseChannel', Updates.channel)
Sentry.setTag('runtimeVersion', Updates.manifest.runtimeVersion)
Sentry.setTag('appPublishedTime', Updates.manifest.publishedTime)
Sentry.setTag('expoSdkVersion', Updates.manifest.sdkVersion)
Sentry.setTag('deviceId', Constants.sessionId)
Sentry.setTag('appOwnership', Constants.appOwnership || 'N/A')
if (Constants.appOwnership === 'expo' && Constants.expoVersion) {
  Sentry.setTag('expoAppVersion', Constants.expoVersion)
}
Sentry.setTag('expoChannel', Updates.channel)

function App() {
  const { styles } = getThemeService()
  return (
    <SafeAreaProvider style={styles.layer1}>
      <RootSiblingParent>
        <AppSettingsService>
          <ThemeProvider>
            <ErrorBoundary>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <AlertService>
                  <FetchPrepare>
                    <AppSWRConfig>
                      <ActionSheetProvider>
                        <NavigationContainer>
                          <ImgurService>
                            <BottomSheetModalProvider>
                              <ClipboardWatcher>
                                <AuthService>
                                  <ViewedTopicsService>
                                    <NotificationService>
                                      <Layout>
                                        <AppStack />
                                        {/* <DebugScreen /> */}
                                      </Layout>
                                    </NotificationService>
                                  </ViewedTopicsService>
                                </AuthService>
                              </ClipboardWatcher>
                            </BottomSheetModalProvider>
                          </ImgurService>
                        </NavigationContainer>
                      </ActionSheetProvider>
                    </AppSWRConfig>
                  </FetchPrepare>
                </AlertService>
              </GestureHandlerRootView>
            </ErrorBoundary>
          </ThemeProvider>
        </AppSettingsService>
      </RootSiblingParent>
    </SafeAreaProvider>
  )
}

export default Sentry.wrap(App)
