import { ConfigContext, ExpoConfig } from 'expo/config'

import packageJson from './package.json'

export default ({ config }: ConfigContext): ExpoConfig => {
  const merged = {
    ...config,
    name: 'R2V',
    slug: 'v2ex-react-native',
    icon: './src/assets/icons/icon-r2v-light.png',
    userInterfaceStyle: 'automatic',
    scheme: 'r2v',
    jsEngine: 'hermes',
    updates: {
      fallbackToCacheTimeout: 0,
      url: 'https://u.expo.dev/5c24d369-c0ba-41e3-8679-8b8cee82fc13',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.kucial.v2ex',
      runtimeVersion: packageJson.version.split('.').slice(0, -1).join('.'),
      icon: './src/assets/r2v-icon.icon',
      splash: {
        image: './src/assets/splash.png',
        backgroundColor: '#ffffff',
        dark: {
          image: './src/assets/splash-dark.png',
          backgroundColor: '#111111',
        },
      },
      infoPlist: {
        CFBundleDevelopmentRegion: 'zh-hans',
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './src/assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF',
      },
      splash: {
        image: './src/assets/splash-icon.png',
        backgroundColor: '#ffffff',
        resizeMode: 'contain',
        dark: {
          image: './src/assets/splash-dark-icon.png',
          resizeMode: 'contain',
          backgroundColor: '#111111',
        },
      },
      package: 'com.kucial.v2ex',
    },
    extra: {
      eas: {
        projectId: '5c24d369-c0ba-41e3-8679-8b8cee82fc13',
      },
    },
    appRouter: {
      root: './src/app',
    },
    experiments: {
      typedRoutes: true,
      buildCacheProvider: {
        plugin: 'eas-local-cache',
      },
    },
    plugins: [
      [
        'expo-asset',
        {
          assets: ['./src/assets/images', './src/assets/brand_icons'],
        },
      ],
      '@sentry/react-native/expo',
      'expo-image-picker',
      'expo-router',
      'expo-build-properties',
      'expo-web-browser',
    ],
  }

  if (process.env.EAS_BUILD_GIT_COMMIT_HASH) {
    merged.extra.buildTag =
      '#' + process.env.EAS_BUILD_GIT_COMMIT_HASH.slice(0, 7)
  } else {
    merged.extra.buildTag = new Date().toISOString()
  }

  return merged as ExpoConfig
}
