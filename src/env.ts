import Constants from 'expo-constants'

export const SENTRY_DSN = Constants.expoConfig?.extra.SENTRY_DSN
export const IMGUR_CLIENT_ID = Constants.expoConfig?.extra.IMGUR_CLIENT_ID
export const ANALYTICS_INGEST_URL: string | undefined =
  Constants.expoConfig?.extra?.ANALYTICS_INGEST_URL
export const ANALYTICS_INGEST_KEY: string | undefined =
  Constants.expoConfig?.extra?.ANALYTICS_INGEST_KEY
/** Opt a dev build into really POSTing events. See supabase/README.md. */
export const ANALYTICS_DEBUG_INGEST: boolean =
  Constants.expoConfig?.extra?.ANALYTICS_DEBUG_INGEST === true
