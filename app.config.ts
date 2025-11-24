import { ConfigContext, ExpoConfig } from 'expo/config'

const themes = [
  'r2v',
  'gin_blue',
  'gin_dark_purple',
  'gin_purple',
  'gin_green',
  'gin_teal',
  'gin_red',
  'gin_orange',
  'gin_yellow',
  'gin_pink',
]

const icons: Record<
  string,
  {
    image: string
    prerendered: boolean
    platforms: ('ios' | 'android')[]
  }
> = {}

themes.forEach((theme) => {
  icons[`${theme}_light`] = {
    image: `./src/assets/icons/icon-${theme}-light.png`, // icon path
    prerendered: true, // for ios UIPrerenderedIcon option
    platforms: ['ios'],
  }
  icons[`${theme}_dark`] = {
    image: `./src/assets/icons/icon-${theme}-dark.png`, // icon path
    prerendered: true, // for ios UIPrerenderedIcon option
    platforms: ['ios'],
  }
})

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
      runtimeVersion: '1.9',
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
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './src/assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF',
      },
      splash: {
        image: './src/assets/splash.png',
        backgroundColor: '#ffffff',
        resizeMode: 'contain',
        dark: {
          image: './src/assets/splash-dark.png',
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
    },
    plugins: [
      'expo-router',
      [
        'expo-asset',
        {
          assets: ['./src/assets/images', './src/assets/brand_icons'],
        },
      ],
      ['expo-dynamic-app-icon', icons],
      '@sentry/react-native/expo',
      'expo-image-picker',
      [
        'expo-build-properties',
        {
          android: {
            // zeego targetSdkVersion: 33
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            minSdkVersion: 23,
            buildToolsVersion: '34.0.0',
            kotlinVersion: '1.6.20',
            // kotlinVersion: '1.6.10',
          },
        },
      ],
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
