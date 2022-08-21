import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView
} from 'react-native'
import React, { useRef, useState, useCallback, useEffect } from 'react'
import WebView from 'react-native-webview'
import { useForm, Controller } from 'react-hook-form'
import colors from 'tailwindcss/colors'
import classNames from 'classnames'

import { useAuthService } from '@/containers/AuthService'
import BackButton from '@/components/BackButton'
import Loader from '@/components/Loader'

import logoImage from '@/assets/logo.png'
import { useAlertService } from '@/containers/AlertService'

const extractImageCaptcha = `
(function() {
  if (window.location.pathname === '/signin/cooldown') {
    const message = document.querySelector('#Wrapper .topic_content').textContent.trim();
    const info = document.querySelector('#Wrapper .dock_area').textContent.trim();
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'cooldonw',
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

const checkSubmitStatus = `
(function() {
  const username = document.querySelector('#menu-entry img.avatar')?.getAttribute('alt');
  if (username) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'login_success',
      payload: { username }
    }));
  } else {
    const problems = [
      ...document.querySelectorAll('.problem ul li')
    ].map((item) => item.textContent)
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'login_error',
      payload: problems
    }));
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
  }())`
}

export default function LoginScreen({ navigation }) {
  const [captchaImage, setCaptchaImage] = useState()
  const webviewRef = useRef()
  const nameInput = useRef()
  const scriptsToInject = useRef([extractImageCaptcha])
  const {
    fetchCurrentUser,
    user: currentUser,
    getNextAction
  } = useAuthService()
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const alert = useAlertService()

  useEffect(() => {
    if (currentUser) {
      navigation.goBack()
      const nextAction = getNextAction()
      if (nextAction) {
        nextAction()
      }
    }
  }, [currentUser])

  const { handleSubmit, control, watch } = useForm({
    defaultValues: {
      username: '',
      password: '',
      captcha: ''
    }
  })

  const handleWebviewMessage = useCallback((event) => {
    if (event.nativeEvent.data) {
      const data = JSON.parse(event.nativeEvent.data)
      switch (data.type) {
        case 'captcha_image':
          setCaptchaImage(data.payload)
          break
        case 'login_success':
          alert.alertWithType('success', '成功', '登录成功')
          fetchCurrentUser()
          break
        case 'login_error':
          setIsSubmitting(false)
          setError(data.payload)
          webviewRef.current.injectJavaScript(extractImageCaptcha)
          break
        case 'colldown':
          setError([data.payload.message, data.payload.info])
        default:
          console.log('NOT_HANDLED_MESSAGE: ', data)
      }
    }
  }, [])

  const submitLoginForm = useCallback((data) => {
    if (isSubmitting) {
      return
    }
    setIsSubmitting(true)
    const submitFormScript = getSubmitScripts(data)
    scriptsToInject.current.unshift(checkSubmitStatus)
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
    <View className="flex-1 bg-white">
      <View className="u-absolute left-1 top-1">
        <BackButton
          onPress={() => {
            navigation.goBack()
          }}
        />
      </View>
      <ScrollView className="flex-1 w-full ">
        <View className="flex flex-row justify-center mt-1">
          <Image style={{ width: 94, height: 30 }} source={logoImage} />
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
                  'opacity-0': !values.username
                })}>
                用户名
              </Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="h-[44px] px-2 bg-gray-100 mb-2 rounded-md"
                    onBlur={onBlur}
                    placeholder="用户名"
                    onChangeText={(value) => onChange(value)}
                    value={value}
                    selectionColor={colors.gray[600]}
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
                  'opacity-0': !values.password
                })}>
                密码
              </Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="h-[44px] px-2 bg-gray-100 mb-2 rounded-md"
                    onBlur={onBlur}
                    placeholder="密码"
                    onChangeText={(value) => onChange(value)}
                    secureTextEntry
                    selectionColor={colors.gray[600]}
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
                      height: (captchaImage.height / captchaImage.width) * 300
                    }}
                  />
                </Pressable>
              ) : (
                <View
                  style={{ wdith: 300, height: 75 }}
                  className="rounded-md mb-2 mt-1 bg-gray-100"
                />
              )}
              <Text
                className={classNames('text-xs pl-2 pb-[2px]', {
                  'opacity-0': !values.captcha
                })}>
                验证码
              </Text>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="h-[44px] px-2 bg-gray-100 mb-2 rounded-md"
                    selectionColor={colors.gray[600]}
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
                  'h-[44px] bg-gray-900 rounded-md flex items-center justify-center active:opacity-60 mt-4',
                  {
                    'opacity-60': isSubmitting
                  }
                )}
                onPress={(e) => {
                  if (isSubmitting) {
                    return
                  }
                  handleSubmit(submitLoginForm)(e)
                }}>
                {isSubmitting ? (
                  <Loader size={20} color="#ffffffbc" />
                ) : (
                  <Text className="text-white text-base">登录</Text>
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

              {/* <View className="h-[1px] w-full bg-gray-100 mt-8 mb-4"></View>
              <Pressable
                className="h-[44px] rounded-md flex items-center justify-center active:bg-gray-200 active:opacity-60"
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
