import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SENTRY_DSN } from '@env'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import * as Sentry from 'sentry-expo'

import ErrorBoundary from './src/components/ErrorBoundary'
import ActivityIndicator from './src/containers/ActivityIndicator'
import AppSWRConfig from './src/containers/AppSWRConfig'
import AlertService from './src/containers/AlertService'
import AppSettingsService from './src/containers/AppSettingsService'
import AuthService from './src/containers/AuthService'
import ImgurService from './src/containers/ImgurService'
import NavigationContainer from './src/containers/NavigationContainer'
import { ThemeProvider } from './src/containers/ThemeService'
import ViewedTopicsService from './src/containers/ViewedTopicsService'
import AppStack from './src/screens/AppStack'
// import DebugScreen from './src/screens/DebugScreen'

import V2exClientWebView from '@/utils/v2ex-client/V2exClientWebView'

Sentry.init({
  dsn: SENTRY_DSN,
  enableInExpoDevelopment: false,
  debug: false,
  tracesSampleRate: 1.0,
})

function App() {
  return (
    <AppSettingsService>
      <ThemeProvider>
        <V2exClientWebView />
        <ErrorBoundary>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppSWRConfig>
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
            </AppSWRConfig>
          </GestureHandlerRootView>
        </ErrorBoundary>
      </ThemeProvider>
    </AppSettingsService>
  )
}

export default App
