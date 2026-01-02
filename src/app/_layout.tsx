import 'react-native-reanimated'
import '@/global.css'
import '@/utils/app-css-interop'

import { useEffect } from 'react'
import { Linking } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { RootSiblingParent } from 'react-native-root-siblings'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'
import { PortalHost, PortalProvider } from '@gorhom/portal'
import { useMMKVDevTools } from '@rozenite/mmkv-plugin'
import { Slot } from 'expo-router'

import ErrorBoundary from '@/components/ErrorBoundary'
import FeedPanelSheet from '@/components/FeedPanelSheet'
import Layout from '@/components/Layout'

import AlertService from '@/containers/AlertService'
import AuthService from '@/containers/AuthService'
import ClipboardWatcher from '@/containers/ClipboardWatcher'
import FetchPrepare from '@/containers/FetchPrepare'
import ImgurService from '@/containers/ImgurService'
import NotificationService from '@/containers/NotificationService'
import QueryClientProvider from '@/containers/QueryClientProvider'
import { getThemeService, ThemeProvider } from '@/containers/ThemeService'
import TopicSheetService from '@/containers/TopicSheetService'
import ViewedTopicsService from '@/containers/ViewedTopicsService'
import { initSentry } from '@/lib/sentry'
import { registerBackgroundTaskAsync } from '@/lib/widget-background-task'
import { handleDeepLink } from '@/utils/deeplink'
import { storage } from '@/utils/storage'

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

  useMMKVDevTools({
    storages: {
      state: storage,
    },
  })

  return (
    <SafeAreaProvider style={styles.layer1}>
      <RootSiblingParent>
        <ThemeProvider>
          <ErrorBoundary>
            <GestureHandlerRootView>
              <AlertService>
                <FetchPrepare>
                  <QueryClientProvider>
                    <PortalProvider>
                      <ActionSheetProvider>
                        <ImgurService>
                          <ClipboardWatcher>
                            <AuthService>
                              <ViewedTopicsService>
                                <NotificationService>
                                  <TopicSheetService>
                                    <Layout>
                                      <Slot />
                                      <PortalHost name='overlay' />
                                      <FeedPanelSheet />
                                    </Layout>
                                  </TopicSheetService>
                                </NotificationService>
                              </ViewedTopicsService>
                            </AuthService>
                          </ClipboardWatcher>
                        </ImgurService>
                      </ActionSheetProvider>
                    </PortalProvider>
                  </QueryClientProvider>
                </FetchPrepare>
              </AlertService>
            </GestureHandlerRootView>
          </ErrorBoundary>
        </ThemeProvider>
      </RootSiblingParent>
    </SafeAreaProvider>
  )
}
