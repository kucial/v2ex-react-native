import { useRef, useState } from 'react'
import { Linking, Pressable, StyleSheet, View } from 'react-native'
import {
  ArrowTopRightOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'react-native-heroicons/outline'
import { NProgress } from 'react-native-nprogress'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { WebView } from 'react-native-webview'
import { useLocalSearchParams } from 'expo-router'

import NavigationHeader from '@/components/NavigationHeader'

import { USER_AGENT } from '@/constants'
import { useTheme } from '@/containers/ThemeService'

export default function BrowserScreen() {
  const [loading, setLoading] = useState(false)
  const webviewRef = useRef<WebView>(null)
  const { styles, theme } = useTheme()
  const [historyState, setHistoryState] = useState({
    canGoBack: false,
    canGoForward: false,
  })
  const params = useLocalSearchParams()
  const url = params.url as string
  const insets = useSafeAreaInsets()

  console.log(url)
  return (
    <View style={browserStyles.container}>
      <NavigationHeader
        canGoBack
        headerRight={() => (
          <Pressable
            style={({ pressed }) => [
              browserStyles.headerBtn,
              pressed && browserStyles.pressed,
            ]}
            onPress={() => {
              Linking.openURL(url)
            }}
          >
            <ArrowTopRightOnSquareIcon size={24} color={theme.colors.primary} />
          </Pressable>
        )}
      />
      <WebView
        pullToRefreshEnabled
        userAgent={USER_AGENT}
        ref={webviewRef}
        style={{ flex: 1 }}
        originWhitelist={['*']}
        source={{ uri: url }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        decelerationRate='normal'
        sharedCookiesEnabled={true}
        onNavigationStateChange={(navState) => {
          setHistoryState({
            canGoBack: navState.canGoBack,
            canGoForward: navState.canGoForward,
          })
        }}
      />
      <View style={browserStyles.progressWrap}>
        <NProgress
          backgroundColor={theme.colors.primary}
          height={3}
          enabled={loading}
        />
      </View>
      {(historyState.canGoBack || historyState.canGoForward) && (
        <View style={[{ paddingBottom: insets.bottom }, styles.overlay]}>
          <View style={browserStyles.navRow}>
            <Pressable
              style={({ pressed }) => [
                browserStyles.navBtn,
                !historyState.canGoBack && browserStyles.disabled,
                pressed && [
                  browserStyles.navBtnPressed,
                  { backgroundColor: theme.colors.overlay_input_bg },
                ],
              ]}
              disabled={!historyState.canGoBack}
              onPress={() => {
                webviewRef.current?.goBack()
              }}
            >
              <ChevronLeftIcon color={styles.text_meta.color} size={22} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                browserStyles.navBtn,
                !historyState.canGoForward && browserStyles.disabled,
                pressed && [
                  browserStyles.navBtnPressed,
                  { backgroundColor: theme.colors.overlay_input_bg },
                ],
              ]}
              disabled={!historyState.canGoForward}
              onPress={() => {
                webviewRef.current?.goForward()
              }}
            >
              <ChevronRightIcon color={styles.text_meta.color} size={22} />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  )
}

const browserStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBtn: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  progressWrap: {
    position: 'absolute',
    width: '100%',
    top: 0,
  },
  navRow: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtn: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  navBtnPressed: {
    opacity: 0.5,
  },
})
