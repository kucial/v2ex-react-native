import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import GoogleIcon from '@/components/GoogleIcon'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'

import { useAppSettings } from '@/containers/AppSettingsService'
import { useTheme } from '@/containers/ThemeService'
import { fetchLoginForm, loginWithPassword } from '@/utils/v2ex-client'

type PasswordSigninProps = {
  onSelectGoogleSignin(): void
  onSuccess(state?: { code: '2fa'; once: string; message: string }): void
}

function PasswordSignin(props: PasswordSigninProps) {
  const router = useRouter()
  const { theme, styles } = useTheme()
  const insets = useSafeAreaInsets()

  const formQuery = useQuery({
    queryKey: ['$tmp$/password-login'],
    queryFn: async () => {
      const { data } = await fetchLoginForm()
      return data
    },
  })

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
        const res = await loginWithPassword(
          {
            ...data,
            once: formQuery.data.once,
          },
          formQuery.data.hashMap,
        )
        props.onSuccess(res.data)
      } catch (err) {
        console.log(err.code, err)
        switch (err.code) {
          case 'LOGIN_ERROR':
            setError(err.data)
            formQuery.refetch()
            break
          default:
            setError([err.message])
            formQuery.refetch()
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [formQuery, isSubmitting, props],
  )

  const refreshCaptcha = useCallback(async () => {
    await formQuery.refetch()
  }, [formQuery])

  useEffect(() => {
    nameInput.current?.focus()
  }, [])

  const values = watch()
  return (
    <View
      style={[
        pwdSignStyles.container,
        Platform.OS === 'android' ? styles.layer1 : styles.overlay,
      ]}
    >
      <View
        style={[
          pwdSignStyles.backWrap,
          Platform.OS === 'android' && {
            marginTop: insets.top,
          },
        ]}
      >
        <BackButton
          tintColor={theme.colors.text}
          onPress={() => {
            router.back()
          }}
        />
      </View>
      <ScrollView style={pwdSignStyles.scrollView}>
        <MaxWidthWrapper>
          <View style={pwdSignStyles.spacer}>
            {/* <View style={{ width: 94, height: 20 }}></View> */}
          </View>
          <Pressable
            style={pwdSignStyles.pressableWidth}
            onPress={() => {
              Keyboard.dismiss()
            }}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={pwdSignStyles.kav}
            >
              <View style={pwdSignStyles.formContainer}>
                <Text
                  style={[
                    pwdSignStyles.label,
                    !values.username && pwdSignStyles.opacity0,
                    styles.text,
                    styles.text_xs,
                  ]}
                >
                  用户名
                </Text>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        pwdSignStyles.input,
                        styles.text,
                        Platform.OS === 'android'
                          ? styles.input__bg
                          : styles.overlay_input__bg,
                      ]}
                      placeholderTextColor={theme.colors.text_placeholder}
                      onBlur={onBlur}
                      placeholder='用户名'
                      onChangeText={(value) => onChange(value)}
                      value={value}
                      spellCheck={false}
                      autoCorrect={false}
                      autoCapitalize='none'
                      ref={nameInput}
                    />
                  )}
                  name='username'
                  rules={{ required: true }}
                />
                <Text
                  style={[
                    pwdSignStyles.label,
                    !values.password && pwdSignStyles.opacity0,
                    styles.text,
                    styles.text_xs,
                  ]}
                >
                  密码
                </Text>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        pwdSignStyles.input,
                        styles.text,
                        Platform.OS === 'android'
                          ? styles.input__bg
                          : styles.overlay_input__bg,
                      ]}
                      placeholderTextColor={theme.colors.text_placeholder}
                      onBlur={onBlur}
                      placeholder='密码'
                      onChangeText={(value) => onChange(value)}
                      secureTextEntry
                      value={value}
                      autoCorrect={false}
                      autoCapitalize='none'
                    />
                  )}
                  name='password'
                  rules={{ required: true }}
                />
                {formQuery.data?.captcha ? (
                  <Pressable
                    onPress={refreshCaptcha}
                    style={({ pressed }) => [
                      pwdSignStyles.captchaPressable,
                      pressed && pwdSignStyles.pressed60,
                    ]}
                    disabled={formQuery.isLoading}
                  >
                    <Image
                      source={{ uri: formQuery.data.captcha }}
                      style={[
                        pwdSignStyles.captchaImg,
                        {
                          opacity: formQuery.isLoading ? 0.5 : 1,
                        },
                      ]}
                    />
                  </Pressable>
                ) : (
                  <View
                    style={[pwdSignStyles.captchaPlaceholder, styles.layer1]}
                  />
                )}
                <Text
                  style={[
                    pwdSignStyles.label,
                    !values.captcha && pwdSignStyles.opacity0,
                    styles.text,
                    styles.text_xs,
                  ]}
                >
                  验证码
                </Text>
                <Controller
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[
                        pwdSignStyles.input,
                        styles.text,
                        Platform.OS === 'android'
                          ? styles.input__bg
                          : styles.overlay_input__bg,
                      ]}
                      placeholderTextColor={theme.colors.text_placeholder}
                      onBlur={onBlur}
                      placeholder='验证码'
                      onChangeText={(value) => onChange(value)}
                      value={value}
                      spellCheck={false}
                      autoCorrect={false}
                      autoCapitalize='none'
                      returnKeyLabel='登录'
                      returnKeyType='go'
                      onSubmitEditing={(e) => {
                        handleSubmit(submitLoginForm)(e)
                      }}
                    />
                  )}
                  name='captcha'
                  rules={{ required: true }}
                />

                <Button
                  style={pwdSignStyles.loginBtn}
                  size='md'
                  variant='primary'
                  disabled={!formQuery.data || isSubmitting}
                  loading={isSubmitting}
                  onPress={(e) => {
                    if (isSubmitting) {
                      return
                    }
                    handleSubmit(submitLoginForm)(e)
                  }}
                  label='登录'
                />

                {!formQuery.isLoading && formQuery.error && (
                  <View style={pwdSignStyles.errWrap}>
                    <Text style={styles.text_danger}>
                      {formQuery.error.message}
                    </Text>
                  </View>
                )}
                {error && (
                  <View style={pwdSignStyles.errWrap}>
                    {error.map((str) => (
                      <View key={str}>
                        <Text style={styles.text_danger}>{str}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {googleSigninEnabled && (
                  <View style={pwdSignStyles.googleSection}>
                    <Pressable
                      style={({ pressed }) => [
                        pwdSignStyles.googleBtn,
                        pressed && pwdSignStyles.pressed70,
                      ]}
                      onPress={props.onSelectGoogleSignin}
                    >
                      <View style={pwdSignStyles.googleIconWrap}>
                        <GoogleIcon />
                      </View>
                      <View>
                        <Text style={styles.text_desc}>谷歌登录</Text>
                      </View>
                    </Pressable>
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
          </Pressable>
        </MaxWidthWrapper>
      </ScrollView>
    </View>
  )
}

const pwdSignStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backWrap: {
    paddingLeft: 4,
    paddingTop: 8,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  spacer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  pressableWidth: {
    width: '100%',
  },
  kav: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  formContainer: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
  },
  label: {
    paddingLeft: 8,
    paddingBottom: 2,
  },
  opacity0: {
    opacity: 0,
  },
  input: {
    height: 44,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  captchaPressable: {
    marginBottom: 8,
    marginTop: 4,
    width: 320,
    height: 80,
  },
  pressed60: {
    opacity: 0.6,
  },
  captchaImg: {
    borderRadius: 6,
    width: 320,
    height: 80,
  },
  captchaPlaceholder: {
    width: 320,
    height: 80,
    borderRadius: 6,
    marginBottom: 8,
    marginTop: 4,
  },
  loginBtn: {
    marginTop: 16,
  },
  errWrap: {
    marginTop: 16,
  },
  googleSection: {
    marginTop: 32,
  },
  googleBtn: {
    height: 44,
    flexDirection: 'row',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed70: {
    opacity: 0.7,
  },
  googleIconWrap: {
    marginRight: 8,
  },
})

export default memo(PasswordSignin)
