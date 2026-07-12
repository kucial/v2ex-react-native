import { useCallback } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Sentry from '@sentry/react-native'
import { useRouter } from 'expo-router'
import { z } from 'zod'

import { TextField } from '@/components/form'
import GroupWapper from '@/components/GroupWrapper'
import Loader from '@/components/Loader'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import NavigationHeader from '@/components/NavigationHeader'

import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { useCurrentUser } from '@/stores/auth'

const FeedbackSchema = z.object({
  name: z.string().min(1, '请输入名称'),
  email: z.string().min(1, '请输入邮箱').email('请输入有效的邮箱地址'),
  comments: z.string().min(1, '请输入反馈内容'),
})

type FormValues = z.infer<typeof FeedbackSchema>

export default function FeedbackScreen() {
  const router = useRouter()
  const { styles } = useTheme()
  const alert = useAlertService()
  const user = useCurrentUser()

  const form = useForm<FormValues>({
    resolver: zodResolver(FeedbackSchema),
    defaultValues: {
      name: user?.username || '',
      email: '',
      comments: '',
    },
    mode: 'onBlur',
  })

  const {
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = form

  const submitFeedback = useCallback(
    async (values: FormValues) => {
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
              <FormProvider {...form}>
                <View style={feedbackStyles.formInner}>
                  <TextField
                    name='name'
                    label='名称'
                    placeholder='名称'
                    spellCheck={false}
                    autoCorrect={false}
                    autoCapitalize='none'
                    style={feedbackStyles.field}
                  />
                  <TextField
                    name='email'
                    label='邮箱'
                    placeholder='邮箱'
                    spellCheck={false}
                    autoCorrect={false}
                    autoCapitalize='none'
                    keyboardType='email-address'
                    style={feedbackStyles.field}
                  />
                  <TextField
                    name='comments'
                    label='留言'
                    placeholder='留言'
                    multiline
                    inputStyle={feedbackStyles.textarea}
                    style={feedbackStyles.field}
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
                    onPress={() => {
                      handleSubmit(submitFeedback)()
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
              </FormProvider>
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
  field: {
    marginBottom: 12,
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
