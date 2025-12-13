// Learn more https://docs.expo.io/guides/customizing-metro
const { withRozenite } = require('@rozenite/metro')
const { getSentryExpoConfig } = require('@sentry/react-native/metro')
const { withNativeWind } = require('nativewind/metro')

const {
  wrapWithReanimatedMetroConfig,
} = require('react-native-reanimated/metro-config')

const config = getSentryExpoConfig(__dirname)

config.resolver.assetExts.push('html')
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles']

module.exports = withRozenite(
  wrapWithReanimatedMetroConfig(
    withNativeWind(config, { input: './src/global.css', inlineRem: 16 }),
  ),
  { enabled: process.env.WITH_ROZENITE === 'true' },
)
