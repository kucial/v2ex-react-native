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
import classNames from 'classnames'

import { USER_AGENT } from '@/constants'

export default function BrowserScreen({ route, navigation }) {
  const [loading, setLoading] = useState(false)
  const webviewRef = useRef()
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
        <SafeAreaView className="bg-neutral-100">
          <View className="h-[44px] flex flex-row items-center justify-center">
            <Pressable
              className={classNames(
                'basis-1/2 h-[44px] items-center justify-center active:opacity-60 active:bg-white',
                {
                  'opacity-50': !historyState.canGoBack,
                },
              )}
              disabled={!historyState.canGoBack}
              onPress={() => {
                webviewRef.current?.goBack()
              }}>
              <ChevronLeftIcon color="#333" size={20} />
            </Pressable>
            <Pressable
              className={classNames(
                'basis-1/2 h-[44px] items-center justify-center active:opacity-60 active:bg-white',
                {
                  'opacity-50': !historyState.canGoForward,
                },
              )}
              disabled={!historyState.canGoForward}
              onPress={() => {
                webviewRef.current?.goForward()
              }}>
              <ChevronRightIcon color="#333" size={20} />
            </Pressable>
          </View>
        </SafeAreaView>
      )}
    </View>
  )
}
