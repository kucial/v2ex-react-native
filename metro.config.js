// Learn more https://docs.expo.io/guides/customizing-metro
const { getSentryExpoConfig } = require('@sentry/react-native/metro')
const { withNativeWind } = require('nativewind/metro')

const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config')

const config = getSentryExpoConfig(__dirname)

config.resolver.assetExts.push('html')
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles']

module.exports = wrapWithReanimatedMetroConfig(
  withNativeWind(config, { input: './src/global.css', inlineRem: 16 }),
)
