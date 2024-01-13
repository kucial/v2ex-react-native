import { useLayoutEffect, useRef, useState } from 'react'
import { SafeAreaView, View } from 'react-native'
import { Pressable } from 'react-native'
import { Linking } from 'react-native'
import {
  ArrowTopRightOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'react-native-heroicons/outline'
import { NProgress } from 'react-native-nprogress'
import { WebView } from 'react-native-webview'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import classNames from 'classnames'

import { USER_AGENT } from '@/constants'
import { useTheme } from '@/containers/ThemeService'

type BrowserScreenProps = NativeStackScreenProps<AppStackParamList, 'browser'>

export default function BrowserScreen({
  route,
  navigation,
}: BrowserScreenProps) {
  const [loading, setLoading] = useState(false)
  const webviewRef = useRef<WebView>(null)
  const { styles } = useTheme()
  const [historyState, setHistoryState] = useState({
    canGoBack: false,
    canGoForward: false,
  })

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: (props) => (
        <Pressable
          className="h-[44px] w-[44px] items-center justify-center -mr-3 active:opacity-60"
          onPress={() => {
            Linking.openURL(route.params.url)
          }}>
          <ArrowTopRightOnSquareIcon size={24} color={props.tintColor} />
        </Pressable>
      ),
    })
  }, [])
  return (
    <View style={{ flex: 1 }}>
      <WebView
        pullToRefreshEnabled
        userAgent={USER_AGENT}
        ref={webviewRef}
        style={{ flex: 1 }}
        source={{ uri: route.params.url }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        decelerationRate="normal"
        onNavigationStateChange={(navState) => {
          setHistoryState({
            canGoBack: navState.canGoBack,
            canGoForward: navState.canGoForward,
          })
        }}
      />
      <View className="absolute w-full top-0">
        <NProgress backgroundColor="#333" height={3} enabled={loading} />
      </View>
      {(historyState.canGoBack || historyState.canGoForward) && (
        <SafeAreaView style={styles.overlay}>
          <View className="h-[44px] flex flex-row items-center justify-center">
            <Pressable
              className={classNames(
                'basis-1/2 h-[44px] items-center justify-center active:opacity-50 active:bg-neutral-100 dark:active:bg-neutral-600',
                {
                  'opacity-50': !historyState.canGoBack,
                },
              )}
              disabled={!historyState.canGoBack}
              onPress={() => {
                webviewRef.current?.goBack()
              }}>
              <ChevronLeftIcon color={styles.text_meta.color} size={22} />
            </Pressable>
            <Pressable
              className={classNames(
                'basis-1/2 h-[44px] items-center justify-center active:opacity-50 active:bg-neutral-100 dark:active:bg-neutral-600',
                {
                  'opacity-50': !historyState.canGoForward,
                },
              )}
              disabled={!historyState.canGoForward}
              onPress={() => {
                webviewRef.current?.goForward()
              }}>
              <ChevronRightIcon color={styles.text_meta.color} size={22} />
            </Pressable>
          </View>
        </SafeAreaView>
      )}
    </View>
  )
}
