import { memo, useCallback, useRef, useState } from 'react'
import { Alert, Platform, Pressable, Text, View } from 'react-native'
import WebView from 'react-native-webview'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import BackButton from '@/components/BackButton'
import Loader from '@/components/Loader'
import { USER_AGENT } from '@/constants'
import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { fetchOnce } from '@/utils/v2ex-client'

import { checkAuthStatus, get2FASubmitCode } from './scripts'
import { useQuery } from '@tanstack/react-query'

type GoogleSigninProps = NativeStackScreenProps<AppStackParamList, 'signin'> & {
  onSelectPasswordSignin(): void
  onSuccess(): void
}

function GoogleSign(props: GoogleSigninProps) {
  const { navigation } = props
  const { theme, styles } = useTheme()
  const webviewRef = useRef<WebView>()
  const [loading, setLoading] = useState(false)
  const onceQuery = useQuery({
    queryKey: ['$tmp$/once-token.json'],
    queryFn: () => {
      return fetchOnce()
    },
    staleTime: 0,
    refetchOnMount: true,
  })
  const scriptsToInject = useRef([])
  const alert = useAlertService()

  const handleWebviewMessage = useCallback((event) => {
    if (event.nativeEvent.data) {
      const data = JSON.parse(event.nativeEvent.data)
      switch (data.type) {
        case '2fa':
          Alert.prompt(
            '你的账号已开启两步验证，请输入验证码',
            undefined,
            async (val) => {
              webviewRef.current.injectJavaScript(get2FASubmitCode(val))
              scriptsToInject.current.unshift(checkAuthStatus)
            },
          )
          break
        case 'login_success':
          props.onSuccess()
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
    <View className="flex-1" style={styles.overlay}>
      <View
        className="min-h-[44px] flex-row justify-between p-1"
        style={[styles.border_b_light]}>
        <BackButton
          tintColor={theme.colors.text}
          onPress={() => {
            navigation.goBack()
          }}
        />
        <Pressable
          className="h-[44px] px-3 justify-center active:opacity-70"
          onPress={props.onSelectPasswordSignin}>
          <Text style={styles.text}>密码登录</Text>
        </Pressable>
      </View>
      <View className="flex-1 relative">
        {onceQuery.data && (
          <WebView
            ref={webviewRef}
            userAgent={USER_AGENT}
            originWhitelist={['*']}
            sharedCookiesEnabled={true}
            decelerationRate="normal"
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            source={{
              uri: `https://www.v2ex.com/auth/google?once=${onceQuery.data.data}`,
              // uri: Platform.OS == 'android' ?  `https://www.v2ex.com/signin` : `https://www.v2ex.com/auth/google?once=${onceQuery.data.data}`,
            }}
            onLoad={() => {
              const toInject = scriptsToInject.current.shift()
              if (toInject) {
                webviewRef.current.injectJavaScript(toInject)
              }
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
            className="absolute inset-0 p-4 items-center"
            style={styles.layer1}>
            <Loader />
          </View>
        )}
      </View>
    </View>
  )
}

export default memo(GoogleSign)
