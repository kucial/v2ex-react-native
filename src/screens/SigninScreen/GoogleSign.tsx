import { memo, useCallback, useRef, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import WebView from 'react-native-webview'
import CookieManager from '@react-native-cookies/cookies'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'

import BackButton from '@/components/BackButton'
import Loader from '@/components/Loader'

import { USER_AGENT } from '@/constants'
import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { fetchOnce } from '@/utils/v2ex-client'

import { checkAuthStatus, syncCookies } from './scripts'

type GoogleSigninProps = {
  onSelectPasswordSignin(): void
  onSuccess(state?: { code: '2fa'; once: string; message: string }): void
}

function GoogleSign(props: GoogleSigninProps) {
  const router = useRouter()
  const { theme, styles } = useTheme()
  const webviewRef = useRef<WebView>(null)
  const [loading, setLoading] = useState(false)
  const onceQuery = useQuery({
    queryKey: ['$tmp$/once-token.json'],
    queryFn: () => {
      return fetchOnce()
    },
    staleTime: 0,
    refetchOnMount: true,
  })
  const alert = useAlertService()

  const handleWebviewMessage = useCallback((event) => {
    if (event.nativeEvent.data) {
      const data = JSON.parse(event.nativeEvent.data)

      switch (data.type) {
        case '2fa':
          CookieManager.get('https://www.v2ex.com', true).then((cookies) => {
            props.onSuccess({
              code: '2fa',
              once: data.payload.once,
              message: data.payload.message,
            })
          })
          break
        case 'login_success':
          CookieManager.get('https://www.v2ex.com', true).then((cookies) => {
            props.onSuccess()
          })
          break
        case 'login_error':
          setLoading(false)
          break
        case 'timeout':
          setLoading(false)
          webviewRef.current.injectJavaScript(`window.location = '/signin'`)
          break
        case 'cooldown':
          setLoading(false)
          alert.show({ type: 'error', message: data.message })
          break
        default:
          console.log('NOT_HANDLED_MESSAGE: ', data)
      }
    }
  }, [])

  return (
    <View className='flex-1' style={styles.overlay}>
      <View
        className='min-h-[44px] flex-row justify-between p-1'
        style={[styles.border_b_light]}
      >
        <BackButton
          tintColor={theme.colors.text}
          onPress={() => {
            router.back()
          }}
        />
        <Pressable
          className='h-[44px] px-3 justify-center active:opacity-70'
          onPress={props.onSelectPasswordSignin}
        >
          <Text style={styles.text}>密码登录</Text>
        </Pressable>
      </View>
      <View className='flex-1 relative'>
        {onceQuery.data && (
          <WebView
            ref={webviewRef}
            userAgent={USER_AGENT}
            originWhitelist={['*']}
            sharedCookiesEnabled={true}
            decelerationRate='normal'
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            source={{
              uri: `https://www.v2ex.com/auth/google?once=${onceQuery.data.data}`,
              // uri: Platform.OS == 'android' ?  `https://www.v2ex.com/signin` : `https://www.v2ex.com/auth/google?once=${onceQuery.data.data}`,
            }}
            onNavigationStateChange={(navState) => {
              if (navState.loading) {
                return
              }
              console.log('navchange: ', navState.url)
              if (
                navState.url.startsWith('https://www.v2ex.com/auth/google?code')
              ) {
                setLoading(true)
              } else if (navState.url.startsWith('https://www.v2ex.com/')) {
                webviewRef.current.injectJavaScript(checkAuthStatus)
              }
            }}
            onMessage={handleWebviewMessage}
          />
        )}
        {loading && (
          <View
            className='absolute inset-0 p-4 items-center'
            style={styles.layer1}
          >
            <Loader />
          </View>
        )}
      </View>
    </View>
  )
}

export default memo(GoogleSign)
