import * as Sentry from '@sentry/react-native'
import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Updates from 'expo-updates'

import { SENTRY_DSN } from '@/env'
let inited = false

/**
 * Must be handed the navigation container ref via
 * `registerNavigationContainer` or it silently does nothing — see
 * `TrackingService`.
 */
export const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
})

/**
 * Transport failures that say something about the network, not about the app:
 * request timeouts, cancellations and offline errors. Nothing can be fixed in
 * response to them, so reporting them just buries real bugs.
 *
 * `ECONNABORTED` is what axios uses for `timeout of 10000ms exceeded`
 * (REQUEST_TIMEOUT in the v2ex client).
 */
const TRANSPORT_NOISE_CODES = new Set([
  'ECONNABORTED', // axios timeout
  'ETIMEDOUT', // axios timeout with transitional.clarifyTimeoutError
  'ERR_CANCELED', // we aborted the request ourselves
  'ERR_NETWORK', // device offline / DNS failure
])

export function isTransportNoise(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }
  const candidate = error as { code?: unknown; message?: unknown }

  if (
    typeof candidate.code === 'string' &&
    TRANSPORT_NOISE_CODES.has(candidate.code)
  ) {
    return true
  }

  // Fallback: some axios builds surface a timeout without setting `code`.
  return (
    typeof candidate.message === 'string' &&
    /^timeout of \d+ms exceeded$/.test(candidate.message)
  )
}

/**
 * A remote post can reference an image that has expired, been deleted, or
 * rejects hotlinking. The image library reports that content failure as an
 * exception even though the app can continue rendering its fallback UI.
 */
export function isImageLoadNoise(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }
  const message = (error as { message?: unknown }).message
  return (
    typeof message === 'string' &&
    /^Could not get the image from given url: \S+$/.test(message)
  )
}

type NoiseCandidateEvent = {
  message?: unknown
  exception?: { values?: { value?: unknown }[] }
}

/**
 * Same judgement as {@link isTransportNoise}, but applied to an outgoing
 * Sentry event rather than the thrown value.
 *
 * `hint.originalException` is only populated by `captureException`. Anything
 * reported as a bare message — or via `captureEvent` with an error object,
 * which is how V2EX-REACT-NATIVE-5P logged 31k timeouts — arrives with no
 * exception to inspect, so match on the payload instead.
 */
export function isTransportNoiseEvent(event: NoiseCandidateEvent): boolean {
  const messages = [
    event.message,
    ...(event.exception?.values ?? []).map((value) => value?.value),
  ]
  return messages.some((message) => isTransportNoise({ message }))
}

export function isImageLoadNoiseEvent(event: NoiseCandidateEvent): boolean {
  const messages = [
    event.message,
    ...(event.exception?.values ?? []).map((value) => value?.value),
  ]
  return messages.some((message) => isImageLoadNoise({ message }))
}

export const initSentry = () => {
  if (!inited) {
    inited = true
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [navigationIntegration],
      sendDefaultPii: true,
      enabled: !__DEV__,
      // Belt-and-braces: the v2ex client filters these at the interceptor, but
      // an AxiosError can also reach Sentry via the ErrorBoundary, an
      // unhandled rejection, or another client entirely.
      beforeSend(event, hint) {
        if (
          isTransportNoise(hint?.originalException) ||
          isImageLoadNoise(hint?.originalException)
        ) {
          return null
        }
        // Last resort for reports that carry no original exception.
        return isTransportNoiseEvent(event) || isImageLoadNoiseEvent(event)
          ? null
          : event
      },
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
  }
}
