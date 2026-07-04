import { useCallback } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import * as Sentry from '@sentry/react-native'
import { useRouter } from 'expo-router'
import { Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'

import GroupWapper from '@/components/GroupWrapper'
import Loader from '@/components/Loader'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import NavigationHeader from '@/components/NavigationHeader'

import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { useCurrentUser } from '@/stores/auth'

type FormValues = {
  name: string
  email: string
  comments: string
}

const FeedbackSchema = Yup.object().shape({
  name: Yup.string().required('请输入名称'),
  email: Yup.string().required('请输入邮箱').email('请输入有效的邮箱地址'),
  comments: Yup.string().required('请输入反馈内容'),
})

export default function FeedbackScreen() {
  const router = useRouter()
  const { theme, styles } = useTheme()
  const alert = useAlertService()
  const user = useCurrentUser()

  const submitFeedback = useCallback(
    async (values, helpers: FormikHelpers<FormValues>) => {
      const sentryId = Sentry.captureMessage('FEEDBACK')
      Sentry.captureFeedback({
        event_id: sentryId,
        ...values,
      })
      alert.show({ type: 'success', message: '反馈已提交' })
      router.back()
    },
    [alert, router],
  )

  return (
    <View style={feedbackStyles.container}>
      <NavigationHeader canGoBack title='意见反馈' />
      <ScrollView style={feedbackStyles.container}>
        <MaxWidthWrapper style={feedbackStyles.container}>
          <View style={feedbackStyles.formWrap}>
            <GroupWapper innerStyle={styles.layer1}>
              <Formik<FormValues>
                initialValues={{
                  name: user?.username || '',
                  email: '',
                  comments: '',
                }}
                validationSchema={FeedbackSchema}
                onSubmit={submitFeedback}
              >
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
                  <View style={feedbackStyles.formInner}>
                    <Text
                      style={[
                        styles.text,
                        styles.text_xs,
                        feedbackStyles.label,
                        !values.name && feedbackStyles.hidden,
                      ]}
                    >
                      名称
                    </Text>
                    <TextInput
                      style={[
                        styles.text,
                        styles.input__bg,
                        feedbackStyles.input,
                      ]}
                      selectionColor={theme.colors.primary}
                      placeholderTextColor={theme.colors.text_placeholder}
                      placeholder='名称'
                      value={values.name}
                      onChangeText={handleChange('name')}
                      onBlur={handleBlur('name')}
                      spellCheck={false}
                      autoCorrect={false}
                      autoCapitalize='none'
                      // ref={nameInput}
                    />
                    <View style={feedbackStyles.row}>
                      <Text
                        style={[
                          styles.text,
                          styles.text_xs,
                          feedbackStyles.label,
                          !values.email && feedbackStyles.hidden,
                        ]}
                      >
                        邮箱
                      </Text>

                      {values.email && touched.email && (
                        <Text
                          style={[
                            styles.text_danger,
                            styles.text_xs,
                            feedbackStyles.errorText,
                          ]}
                        >
                          {errors.email}
                        </Text>
                      )}
                    </View>

                    <TextInput
                      style={[
                        styles.text,
                        styles.input__bg,
                        feedbackStyles.input,
                      ]}
                      selectionColor={theme.colors.primary}
                      placeholderTextColor={theme.colors.text_placeholder}
                      placeholder='邮箱'
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      spellCheck={false}
                      autoCorrect={false}
                      autoCapitalize='none'
                      keyboardType='email-address'
                    />

                    <Text
                      style={[
                        styles.text,
                        styles.text_xs,
                        feedbackStyles.label,
                        !values.comments && feedbackStyles.hidden,
                      ]}
                    >
                      留言
                    </Text>
                    <TextInput
                      multiline
                      style={[
                        styles.text,
                        styles.input__bg,
                        feedbackStyles.textarea,
                      ]}
                      selectionColor={theme.colors.primary}
                      placeholderTextColor={theme.colors.text_placeholder}
                      value={values.comments}
                      onChangeText={handleChange('comments')}
                      onBlur={handleBlur('comments')}
                    />

                    <Pressable
                      style={({ pressed }) => [
                        feedbackStyles.submitBtn,
                        styles.btn_primary__bg,
                        isSubmitting && feedbackStyles.submitting,
                        !isValid && feedbackStyles.disabled,
                        pressed && feedbackStyles.pressed,
                      ]}
                      disabled={isSubmitting}
                      onPress={(e) => {
                        handleSubmit()
                      }}
                    >
                      {isSubmitting ? (
                        <Loader
                          size={20}
                          color={styles.btn_primary__text.color as string}
                        />
                      ) : (
                        <Text
                          style={[styles.btn_primary__text, styles.text_base]}
                        >
                          提交
                        </Text>
                      )}
                    </Pressable>
                  </View>
                )}
              </Formik>
            </GroupWapper>
          </View>
        </MaxWidthWrapper>
      </ScrollView>
    </View>
  )
}

const feedbackStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formWrap: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  formInner: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    width: '100%',
  },
  label: {
    paddingLeft: 8,
    paddingBottom: 2,
  },
  hidden: {
    opacity: 0,
  },
  input: {
    height: 44,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  row: {
    flexDirection: 'row',
  },
  errorText: {
    marginLeft: 8,
  },
  textarea: {
    minHeight: 120,
    paddingHorizontal: 8,
    paddingVertical: 13,
    marginBottom: 8,
    borderRadius: 6,
  },
  submitBtn: {
    height: 44,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  submitting: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.6,
  },
})
