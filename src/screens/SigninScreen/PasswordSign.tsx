import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import classNames from 'classnames'
import { Image } from 'expo-image'
import useSWR from 'swr'

import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import GoogleIcon from '@/components/GoogleIcon'
import Loader from '@/components/Loader'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useAppSettings } from '@/containers/AppSettingsService'
import prompt2faInput from '@/containers/AuthService/prompt2FaInput'
import { useTheme } from '@/containers/ThemeService'
import { fetchLoginForm, loginWithPassword } from '@/utils/v2ex-client'

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

  const formSwr = useSWR(
    '$tmp$/password-login',
    async () => {
      const { data } = await fetchLoginForm()
      return data
    },
    {},
  )

  const handle2Fa = useCallback(
    async (context) => {
      const result = await prompt2faInput(context)
      if (result?.action === '2fa_verified') {
        props.onSuccess()
      } else if (result?.action === 'logout') {
        navigation.goBack()
      }
    },
    [props.onSuccess],
  )

  const {
    data: { googleSigninEnabled },
  } = useAppSettings()

  const nameInput = useRef<TextInput>(null)
  const [error, setError] = useState<string[]>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { handleSubmit, control, watch } = useForm({
    defaultValues: {
      username: '',
      password: '',
      captcha: '',
    },
  })

  const submitLoginForm = useCallback(
    async (data) => {
      if (isSubmitting) {
        return
      }
      try {
        setIsSubmitting(true)
        setError(null)
        await loginWithPassword(
          {
            ...data,
            once: formSwr.data.once,
          },
          formSwr.data.hashMap,
        )
        props.onSuccess()
      } catch (err) {
        console.log(err.code, err)
        switch (err.code) {
          case '2FA_ENABLED':
            handle2Fa(err)
            break
          case 'LOGIN_ERROR':
            setError(err.data)
            formSwr.mutate()
            break
          default:
            setError([err.message])
            formSwr.mutate()
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [formSwr],
  )

  const refreshCaptcha = useCallback(async () => {
    await formSwr.mutate()
  }, [formSwr])

  useEffect(() => {
    nameInput.current?.focus()
  }, [])

  const values = watch()
  return (
    <View
      className="flex-1"
      style={Platform.OS === 'android' ? styles.layer1 : styles.overlay}>
      <View className="u-absolute left-1 top-1">
        <BackButton
          tintColor={theme.colors.text}
          onPress={() => {
            navigation.goBack()
          }}
        />
      </View>
      <ScrollView className="flex-1 w-full ">
        <MaxWidthWrapper>
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
                      style={[
                        styles.text,
                        Platform.OS === 'android'
                          ? styles.input__bg
                          : styles.overlay_input__bg,
                      ]}
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
                      style={[
                        styles.text,
                        Platform.OS === 'android'
                          ? styles.input__bg
                          : styles.overlay_input__bg,
                      ]}
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
                {formSwr.data?.captcha ? (
                  <Pressable
                    onPress={refreshCaptcha}
                    className="active:opacity-60 mb-2 mt-1"
                    style={{
                      width: 320,
                      height: 80,
                    }}
                    disabled={formSwr.isLoading}>
                    <Image
                      source={{ uri: formSwr.data.captcha }}
                      className="rounded-md"
                      style={{
                        width: 320,
                        height: 80,
                        opacity: formSwr.isLoading ? 0.5 : 1,
                      }}
                    />
                  </Pressable>
                ) : (
                  <View
                    style={[{ width: 320, height: 80 }, styles.layer1]}
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
                      style={[
                        styles.text,
                        Platform.OS === 'android'
                          ? styles.input__bg
                          : styles.overlay_input__bg,
                      ]}
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

                <Button
                  className="mt-4"
                  size="md"
                  variant="primary"
                  disabled={!formSwr.data || isSubmitting}
                  loading={isSubmitting}
                  onPress={(e) => {
                    if (isSubmitting) {
                      return
                    }
                    handleSubmit(submitLoginForm)(e)
                  }}
                  label="登录"
                />

                {formSwr.error && (
                  <View className="mt-4">
                    <Text style={styles.text_danger}>
                      {formSwr.error.message}
                    </Text>
                  </View>
                )}
                {error && (
                  <View className="mt-4">
                    {error.map((str) => (
                      <View key={str}>
                        <Text style={styles.text_danger}>{str}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {googleSigninEnabled && (
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
                )}

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
          </Pressable>
        </MaxWidthWrapper>
      </ScrollView>
    </View>
  )
}

export default memo(PasswordSignin)
