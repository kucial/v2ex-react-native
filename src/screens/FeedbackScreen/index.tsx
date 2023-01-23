import { useCallback } from 'react'
import { View, Text, TextInput, Pressable } from 'react-native'
import classNames from 'classnames'
import { Formik, FormikHelpers } from 'formik'
import * as Sentry from 'sentry-expo'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as Yup from 'yup'

import { useTheme } from '@/containers/ThemeService'
import { useAlertService } from '@/containers/AlertService'

import Loader from '@/components/Loader'
import { useAuthService } from '@/containers/AuthService'

type FormValues = {
  name: string
  email: string
  comments: string
}
type ScreenProps = NativeStackScreenProps<AppStackParamList, 'browser'>

const FeedbackSchema = Yup.object().shape({
  name: Yup.string().required('请输入名称'),
  email: Yup.string().required('请输入邮箱').email('请输入有效的邮箱地址'),
  comments: Yup.string().required('请输入反馈内容'),
})

export default function FeedbackScreen(props: ScreenProps) {
  const { navigation } = props
  const { theme, styles } = useTheme()
  const alert = useAlertService()
  const { user } = useAuthService()

  const submitFeedback = useCallback(
    async (values, helpers: FormikHelpers<FormValues>) => {
      const sentryId = Sentry.Native.captureMessage('FEEDBACK')
      Sentry.Native.captureUserFeedback({
        event_id: sentryId,
        ...values,
      })
      alert.alertWithType('success', '成功', '反馈已提交')
      navigation.goBack()
    },
    [],
  )

  return (
    <View className="flex-1" style={styles.layer1}>
      <Formik<FormValues>
        initialValues={{ name: user?.username || '', email: '', comments: '' }}
        validationSchema={FeedbackSchema}
        onSubmit={submitFeedback}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          isValid,
          isSubmitting,
          errors,
          touched,
        }) => (
          <View className="py-4 px-4 w-full">
            <Text
              className={classNames('text-xs pl-2 pb-[2px]', {
                'opacity-0': !values.name,
              })}
              style={styles.text}>
              名称
            </Text>
            <TextInput
              className="h-[44px] px-2 mb-2 rounded-md"
              style={[styles.text, styles.input__bg]}
              selectionColor={theme.colors.primary}
              placeholderTextColor={theme.colors.text_placeholder}
              placeholder="名称"
              value={values.name}
              onChangeText={handleChange('name')}
              onBlur={handleBlur('name')}
              spellCheck={false}
              autoCorrect={false}
              autoCapitalize="none"
              // ref={nameInput}
            />
            <View className="flex flex-row">
              <Text
                className={classNames('text-xs pl-2 pb-[2px]', {
                  'opacity-0': !values.email,
                })}
                style={styles.text}>
                邮箱
              </Text>

              {values.email && touched.email && (
                <Text className="text-xs ml-2" style={styles.text_danger}>
                  {errors.email}
                </Text>
              )}
            </View>

            <TextInput
              className="h-[44px] px-2 mb-2 rounded-md"
              style={[styles.text, styles.input__bg]}
              selectionColor={theme.colors.primary}
              placeholderTextColor={theme.colors.text_placeholder}
              placeholder="邮箱"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              spellCheck={false}
              autoCorrect={false}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Text
              className={classNames('text-xs pl-2 pb-[2px]', {
                'opacity-0': !values.comments,
              })}
              style={styles.text}>
              留言
            </Text>
            <TextInput
              multiline
              className="min-h-[120px] px-2 py-[13px] mb-2 rounded-md"
              style={[styles.text, styles.input__bg]}
              selectionColor={theme.colors.primary}
              placeholderTextColor={theme.colors.text_placeholder}
              placeholder="留言"
              value={values.comments}
              onChangeText={handleChange('comments')}
              onBlur={handleBlur('comments')}
              autoCapitalize="none"
            />

            <Pressable
              className={classNames(
                'h-[44px] rounded-md flex items-center justify-center mt-4',
                'active:opacity-60',
                {
                  'opacity-60': isSubmitting,
                  'opacity-50': !isValid,
                },
              )}
              disabled={isSubmitting}
              style={styles.btn_primary__bg}
              onPress={(e) => {
                handleSubmit()
              }}>
              {isSubmitting ? (
                <Loader
                  size={20}
                  color={styles.btn_primary__text.color as string}
                />
              ) : (
                <Text className="text-base" style={styles.btn_primary__text}>
                  提交
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </Formik>
    </View>
  )
}
