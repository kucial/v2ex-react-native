import * as Sentry from '@sentry/react-native'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Updates from 'expo-updates'

import { SENTRY_DSN } from '@/env'
let inited = false

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
})

export const initSentry = () => {
  if (!inited) {
    inited = true
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [navigationIntegration],
      sendDefaultPii: true,
      enabled: !__DEV__,
    })

    Sentry.setExtras({
      manifest: Updates.manifest,
      deviceYearClass: Device.deviceYearClass,
      linkingUri: Constants.linkingUri,
    })
    Sentry.setTag('expoReleaseChannel', Updates.channel)
    Sentry.setTag('expoReleaseChannel', Updates.channel)
    Sentry.setTag('runtimeVersion', Updates.manifest.runtimeVersion)
    Sentry.setTag('appPublishedTime', Updates.manifest.publishedTime)
    Sentry.setTag('expoSdkVersion', Updates.manifest.sdkVersion)
    Sentry.setTag('deviceId', Constants.sessionId)
  }
}
