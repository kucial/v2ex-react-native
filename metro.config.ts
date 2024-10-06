// Learn more https://docs.expo.io/guides/customizing-metro
import { getSentryExpoConfig } from '@sentry/react-native/metro'

const defaultConfig = getSentryExpoConfig(__dirname)

module.exports = defaultConfig
