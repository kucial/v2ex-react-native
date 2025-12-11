import 'react-native-reanimated'
import '@/global.css'
import '@/utils/app-css-interop'

import { useEffect } from 'react'
import { Linking } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { RootSiblingParent } from 'react-native-root-siblings'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { Slot } from 'expo-router'

import ErrorBoundary from '@/components/ErrorBoundary'
import Layout from '@/components/Layout'

import AlertService from '@/containers/AlertService'
import AppSettingsService from '@/containers/AppSettingsService'
import AuthService from '@/containers/AuthService'
import ClipboardWatcher from '@/containers/ClipboardWatcher'
import FetchPrepare from '@/containers/FetchPrepare'
import ImgurService from '@/containers/ImgurService'
import NotificationService from '@/containers/NotificationService'
import QueryClientProvider from '@/containers/QueryClientProvider'
import { getThemeService, ThemeProvider } from '@/containers/ThemeService'
import ViewedTopicsService from '@/containers/ViewedTopicsService'
import { initSentry } from '@/lib/sentry'
import { registerBackgroundTaskAsync } from '@/lib/widget-background-task'
import { handleDeepLink } from '@/utils/deeplink'

initSentry()
// Register background task for widget updates
registerBackgroundTaskAsync().catch((error) => {
  console.error('Failed to register background task:', error)
})

const { styles } = getThemeService()

export default function RootLayout() {
  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url)
    })

    return () => sub.remove()
  }, [])

  return (
    <SafeAreaProvider style={styles.layer1}>
      <RootSiblingParent>
        <AppSettingsService>
          <ThemeProvider>
            <ErrorBoundary>
              <GestureHandlerRootView>
                <AlertService>
                  <FetchPrepare>
                    <QueryClientProvider>
                      <ActionSheetProvider>
                        <ImgurService>
                          <ClipboardWatcher>
                            <AuthService>
                              <ViewedTopicsService>
                                <NotificationService>
                                  <Layout>
                                    <Slot />
                                  </Layout>
                                </NotificationService>
                              </ViewedTopicsService>
                            </AuthService>
                          </ClipboardWatcher>
                        </ImgurService>
                      </ActionSheetProvider>
                    </QueryClientProvider>
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
