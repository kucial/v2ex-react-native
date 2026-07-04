import { useCallback, useRef } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Formik, FormikProps } from 'formik'

import Button from '@/components/Button'
import { SelectField, TextField } from '@/components/formik'
import KeyboardAwareView from '@/components/KeyboardAwareView'
import Loader from '@/components/Loader'

import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { editTopic, fetchTopicEditForm } from '@/utils/v2ex-client'

export default function TopicEdit() {
  const { styles } = useTheme()
  const scrollViewRef = useRef<ScrollView>(null)
  const alert = useAlertService()
  const queryClient = useQueryClient()
  const router = useRouter()
  const params = useLocalSearchParams()
  const id = params.id as string
  const topicId = Number(id)

  const fetchFormData = useCallback(async () => {
    try {
      const res = await fetchTopicEditForm(topicId)
      return res.data
    } catch (err) {
      if (err.code == 'NOT_ALLOWED') {
      }
      throw err
    }
  }, [topicId])

  const formQuery = useQuery({
    queryKey: ['/t/:id/edit', topicId],
    queryFn: fetchFormData,
    refetchOnMount: true,
    gcTime: 0,
    staleTime: 0,
  })
  type FormValues = typeof formQuery.data.values

  const handleSubmit = useCallback(
    async (values: FormValues, formikProps: FormikProps<FormValues>) => {
      try {
        formikProps.setSubmitting(true)
        const res = await editTopic(topicId, values)
        alert.show({ type: 'success', message: '主题更新成功' })
        router.back()
        queryClient.setQueryData([`/page/t/:id/topic.json`, topicId], res.data)
        queryClient.setQueryData(['/t/:id/edit', topicId], undefined)
      } catch (err) {
        alert.show({ type: 'error', message: err.message })
      }
    },
    [alert, queryClient, router, topicId],
  )

  if (formQuery.error) {
    return (
      <View style={editStyles.centerPy8}>
        <Text style={styles.text}>{formQuery.error.message}</Text>
      </View>
    )
  }

  if (!formQuery.data) {
    return (
      <View style={editStyles.centerPy8}>
        <Loader />
      </View>
    )
  }

  return (
    <View style={[editStyles.container, styles.layer1]}>
      <KeyboardAwareView
        animated
        style={editStyles.kav}
      >
        <Formik
          initialValues={formQuery.data.values}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {(formikProps) => (
            <ScrollView
              style={[editStyles.container, styles.layer1]}
              ref={scrollViewRef}
              scrollEventThrottle={16}
            >
              <View style={editStyles.formWrap}>
                <TextField name='title' label='标题' />
                <SelectField
                  name='syntax'
                  label='内容类型'
                  options={formQuery.data.schema.syntaxOptions}
                />
                <TextField
                  name='content'
                  label='内容'
                  placeholder='正文内容'
                  multiline
                  inputStyle={{ minHeight: 200 }}
                />
                <Button
                  style={editStyles.submitBtn}
                  size='md'
                  variant='primary'
                  label='更新'
                  loading={formikProps.isSubmitting}
                  disabled={formikProps.isSubmitting}
                  onPress={() => {
                    formikProps.submitForm()
                  }}
                />
              </View>
            </ScrollView>
          )}
        </Formik>
      </KeyboardAwareView>
    </View>
  )
}

const editStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerPy8: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  kav: {
    height: '100%',
  },
  formWrap: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    flex: 1,
  },
  submitBtn: {
    marginTop: 16,
  },
})
