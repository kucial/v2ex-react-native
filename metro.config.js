// Learn more https://docs.expo.io/guides/customizing-metro
const { withRozenite } = require('@rozenite/metro')
const { getSentryExpoConfig } = require('@sentry/react-native/metro')
const {
  withRozeniteReduxDevTools,
} = require('@rozenite/redux-devtools-plugin/metro')

const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config')

const config = getSentryExpoConfig(__dirname)

config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles']

module.exports = withRozenite(
  wrapWithReanimatedMetroConfig(config),
  {
    enabled: process.env.WITH_ROZENITE === 'true',
    enhanceMetroConfig: (config) => withRozeniteReduxDevTools(config),
  },
)
