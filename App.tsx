import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { RootSiblingParent } from 'react-native-root-siblings'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { SENTRY_DSN } from '@env'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import * as Sentry from 'sentry-expo'

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
import { getThemeService, ThemeProvider } from './src/containers/ThemeService'
import ViewedTopicsService from './src/containers/ViewedTopicsService'
import AppStack from './src/screens/AppStack'
// import DebugScreen from './src/screens/DebugScreen'

Sentry.init({
  dsn: SENTRY_DSN,
  enableInExpoDevelopment: false,
  debug: false,
  tracesSampleRate: 1.0,
})

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
                                    <Layout>
                                      <AppStack />
                                      {/* <DebugScreen /> */}
                                    </Layout>
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

export default App
