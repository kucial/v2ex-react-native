import { useRef, useState } from 'react'
import { Linking, Pressable, View } from 'react-native'
import {
  ArrowTopRightOnSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'react-native-heroicons/outline'
import { NProgress } from 'react-native-nprogress'
import { WebView } from 'react-native-webview'
import { useLocalSearchParams } from 'expo-router'

import NavigationHeader from '@/components/NavigationHeader'

import { USER_AGENT } from '@/constants'
import { useTheme } from '@/containers/ThemeService'
import { cn } from '@/lib/utils'

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

  console.log(url)
  return (
    <View className='flex-1'>
      <NavigationHeader
        canGoBack
        headerRight={() => (
          <Pressable
            className='h-[44px] w-[44px] items-center justify-center active:opacity-60'
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
      <View className='absolute w-full top-0'>
        <NProgress
          backgroundColor={theme.colors.primary}
          height={3}
          enabled={loading}
        />
      </View>
      {(historyState.canGoBack || historyState.canGoForward) && (
        <View className='pb-safe' style={styles.overlay}>
          <View className='h-[44px] flex flex-row items-center justify-center'>
            <Pressable
              className={cn(
                'basis-1/2 h-[44px] items-center justify-center active:opacity-50 active:bg-neutral-100 dark:active:bg-neutral-600',
                {
                  'opacity-50': !historyState.canGoBack,
                },
              )}
              disabled={!historyState.canGoBack}
              onPress={() => {
                webviewRef.current?.goBack()
              }}
            >
              <ChevronLeftIcon color={styles.text_meta.color} size={22} />
            </Pressable>
            <Pressable
              className={cn(
                'basis-1/2 h-[44px] items-center justify-center active:opacity-50 active:bg-neutral-100 dark:active:bg-neutral-600',
                {
                  'opacity-50': !historyState.canGoForward,
                },
              )}
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
