import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import WebView from 'react-native-webview'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import classNames from 'classnames'
import { Image } from 'expo-image'

import BackButton from '@/components/BackButton'
import GoogleIcon from '@/components/GoogleIcon'
import Loader from '@/components/Loader'
import { USER_AGENT } from '@/constants'
import { useTheme } from '@/containers/ThemeService'

import { checkAuthStatus, get2FASubmitCode } from './scripts'

const extractImageCaptcha = `
(function() {
  if (window.location.pathname === '/signin/cooldown') {
    const message = document.querySelector('#Wrapper .topic_content').textContent.trim();
    const info = document.querySelector('#Wrapper .dock_area').textContent.trim();
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'cooldown',
      payload: {
        message,
        info,
      }
    }))
    return
  }

  const captchaImage = document.getElementById('captcha-image');
  if (captchaImage) {
    function cloneImageToBase64(el) {
      let canvas = document.createElement('canvas');
      let ctx = canvas.getContext('2d');
      let dataURL;
      canvas.height = el.naturalHeight;
      canvas.width = el.naturalWidth;
      ctx.drawImage(el, 0, 0);
      dataURL = canvas.toDataURL();
      return dataURL
    }
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'captcha_image',
      payload: {
        uri: cloneImageToBase64(captchaImage),
        width: captchaImage.naturalWidth,
        height: captchaImage.naturalHeight,
      }
    }))
    captchaImage.addEventListener('load', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'captcha_image',
        payload: {
          uri: cloneImageToBase64(captchaImage),
          width: captchaImage.naturalWidth,
          height: captchaImage.naturalHeight,
        }
      }))
    })
  }
}())
`

const triggerCaptchaRefresh = `(function() {
  refreshCaptcha()
}())`

const getSubmitScripts = (values) => {
  const { username, password, captcha } = values
  return `(function() {
    const form = document.querySelector('form[action="/signin"]');
    const inputEls = Array.prototype.filter.call(form.elements, function(el){
        return el.classList.contains('sl')
    });
    inputEls[0].value = '${username}';
    inputEls[1].value = '${password}';
    if (inputEls[2]) {
        inputEls[2].value = '${captcha}';
    }
    form.submit();
    setTimeout(() => {
      window.location = '/';
    }, 5000)
  }())`
}

type CaptchaImage = {
  uri: string
  width: number
  height: number
}
type PasswordSigninProps = NativeStackScreenProps<
  AppStackParamList,
  'signin'
> & {
  onSelectGoogleSignin(): void
  onSuccess(): void
}

function PasswordSignin(props: PasswordSigninProps) {
  const { navigation } = props
  const { theme, styles } = useTheme()
  const [captchaImage, setCaptchaImage] = useState<CaptchaImage>()
  const webviewRef = useRef<WebView>(null)
  const nameInput = useRef<TextInput>(null)
  const scriptsToInject = useRef([extractImageCaptcha])
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { handleSubmit, control, watch } = useForm({
    defaultValues: {
      username: '',
      password: '',
      captcha: '',
    },
  })

  const handleWebviewMessage = useCallback((event) => {
    if (event.nativeEvent.data) {
      const data = JSON.parse(event.nativeEvent.data)
      switch (data.type) {
        case 'captcha_image':
          setCaptchaImage(data.payload)
          break
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
          setIsSubmitting(false)
          setError(data.payload)
          webviewRef.current.injectJavaScript(extractImageCaptcha)
          break
        case 'timeout':
          setIsSubmitting(false)
          setError(data.payload)
          scriptsToInject.current.unshift(extractImageCaptcha)
          webviewRef.current.injectJavaScript(`window.location = '/signin'`)
          break
        case 'cooldown':
          setError([data.payload.message, data.payload.info])
          break
        default:
          console.log('NOT_HANDLED_MESSAGE: ', data)
      }
    }
  }, [])

  const submitLoginForm = useCallback((data) => {
    console.log(data)
    if (isSubmitting) {
      return
    }
    setIsSubmitting(true)
    const submitFormScript = getSubmitScripts(data)
    scriptsToInject.current.unshift(checkAuthStatus)
    webviewRef.current.injectJavaScript(submitFormScript)
  }, [])

  const refreshCaptcha = useCallback(() => {
    webviewRef.current.injectJavaScript(triggerCaptchaRefresh)
  }, [])

  useEffect(() => {
    nameInput.current?.focus()
  }, [])

  const values = watch()
  return (
    <View className="flex-1" style={styles.overlay}>
      <View className="u-absolute left-1 top-1">
        <BackButton
          tintColor={theme.colors.text}
          onPress={() => {
            navigation.goBack()
          }}
        />
      </View>
      <ScrollView className="flex-1 w-full ">
        <View className="flex flex-row justify-center mt-1">
          {/* <View style={{ width: 94, height: 20 }}></View> */}
        </View>
        <Pressable
          className="w-full"
          onPress={() => {
            Keyboard.dismiss()
          }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 w-full items-center">
            <View className="py-4 px-8 w-full">
              <Text
                className={classNames('text-xs pl-2 pb-[2px]', {
                  'opacity-0': !values.username,
                })}
                style={styles.text}>
                用户名
              </Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="h-[44px] px-2 mb-2 rounded-md"
                    style={[styles.text, styles.overlay_input__bg]}
                    selectionColor={theme.colors.primary}
                    placeholderTextColor={theme.colors.text_placeholder}
                    onBlur={onBlur}
                    placeholder="用户名"
                    onChangeText={(value) => onChange(value)}
                    value={value}
                    spellCheck={false}
                    autoCorrect={false}
                    autoCapitalize="none"
                    ref={nameInput}
                  />
                )}
                name="username"
                rules={{ required: true }}
              />
              <Text
                className={classNames('text-xs pl-2 pb-[2px]', {
                  'opacity-0': !values.password,
                })}
                style={styles.text}>
                密码
              </Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="h-[44px] px-2 mb-2 rounded-md"
                    style={[styles.text, styles.overlay_input__bg]}
                    selectionColor={theme.colors.primary}
                    placeholderTextColor={theme.colors.text_placeholder}
                    onBlur={onBlur}
                    placeholder="密码"
                    onChangeText={(value) => onChange(value)}
                    secureTextEntry
                    value={value}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                )}
                name="password"
                rules={{ required: true }}
              />
              {captchaImage ? (
                <Pressable
                  onPress={refreshCaptcha}
                  className="active:opacity-60">
                  <Image
                    source={{ uri: captchaImage.uri }}
                    className="rounded-md mb-2 mt-1"
                    style={{
                      width: 300,
                      height: (captchaImage.height / captchaImage.width) * 300,
                    }}
                  />
                </Pressable>
              ) : (
                <View
                  style={[{ width: 300, height: 75 }, styles.layer1]}
                  className="rounded-md mb-2 mt-1"
                />
              )}
              <Text
                className={classNames('text-xs pl-2 pb-[2px]', {
                  'opacity-0': !values.captcha,
                })}
                style={styles.text}>
                验证码
              </Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="h-[44px] px-2 mb-2 rounded-md"
                    style={[styles.text, styles.overlay_input__bg]}
                    selectionColor={theme.colors.primary}
                    placeholderTextColor={theme.colors.text_placeholder}
                    onBlur={onBlur}
                    placeholder="验证码"
                    onChangeText={(value) => onChange(value)}
                    value={value}
                    spellCheck={false}
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyLabel="登录"
                    returnKeyType="go"
                    onSubmitEditing={(e) => {
                      handleSubmit(submitLoginForm)(e)
                    }}
                  />
                )}
                name="captcha"
                rules={{ required: true }}
              />

              <Pressable
                className={classNames(
                  'h-[44px] rounded-md flex items-center justify-center mt-4',
                  'active:opacity-60',
                  {
                    'opacity-60': isSubmitting,
                  },
                )}
                style={styles.btn_primary__bg}
                onPress={(e) => {
                  if (isSubmitting) {
                    return
                  }
                  handleSubmit(submitLoginForm)(e)
                }}>
                {isSubmitting ? (
                  <Loader
                    size={20}
                    color={styles.btn_primary__text.color as string}
                  />
                ) : (
                  <Text className="text-base" style={styles.btn_primary__text}>
                    登录
                  </Text>
                )}
              </Pressable>

              {error && (
                <View className="mt-4">
                  {error.map((str) => (
                    <View key={str}>
                      <Text className="text-red-700">{str}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View className="mt-8">
                <Pressable
                  className="h-[44px] flex-row rounded-md items-center justify-center active:opacity-70"
                  onPress={props.onSelectGoogleSignin}>
                  <View className="mr-2">
                    <GoogleIcon />
                  </View>
                  <View>
                    <Text style={styles.text_desc}>谷歌登录</Text>
                  </View>
                </Pressable>
              </View>

              {/* <View className="h-[1px] w-full bg-neutral-100 mt-8 mb-4"></View>
              <Pressable
                className="h-[44px] rounded-md flex items-center justify-center active:bg-neutral-200 active:opacity-60"
                onPress={() => {
                  console.log('pressed.....')

                  navigation.push('browser', {
                    url: 'https://www.v2ex.com/signup'
                  })
                }}>
                <Text>注册</Text>
              </Pressable> */}
            </View>
          </KeyboardAvoidingView>
          <View style={{ height: 0 }}>
            <WebView
              ref={webviewRef}
              originWhitelist={['*']}
              userAgent={USER_AGENT}
              source={{ uri: 'https://www.v2ex.com/signin' }}
              onLoad={() => {
                const toInject = scriptsToInject.current.shift()
                if (toInject) {
                  webviewRef.current.injectJavaScript(toInject)
                }
              }}
              onMessage={handleWebviewMessage}
            />
          </View>
        </Pressable>
      </ScrollView>
    </View>
  )
}

export default memo(PasswordSignin)
