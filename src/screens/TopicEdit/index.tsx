import { useCallback, useRef } from 'react'
import { ScrollView, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Formik, FormikProps } from 'formik'
import useSWR, { mutate } from 'swr'

import Button from '@/components/Button'
import { SelectField, TextField } from '@/components/formik'
import KeyboardAwareView from '@/components/KeyboardAwareView'
import Loader from '@/components/Loader'
import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { editTopic, fetchTopicEditForm } from '@/utils/v2ex-client'

type ScreenProps = NativeStackScreenProps<AppStackParamList, 'edit-topic'>
export default function TopicEdit(props: ScreenProps) {
  const { route, navigation } = props
  const { styles } = useTheme()
  const scrollViewRef = useRef<ScrollView>()
  const alert = useAlertService()

  const formSwr = useSWR(
    ['/t/:id/edit', route.params?.id],
    async ([, id]) => {
      const res = await fetchTopicEditForm(id)
      return res.data
    },
    {
      revalidateOnMount: true,
      onErrorRetry(err) {
        if (err.code === 'NOT_ALLOWED') {
          return
        }
      },
    },
  )
  type FormValues = typeof formSwr.data.values

  const handleSubmit = useCallback(
    async (values: FormValues, formikProps: FormikProps<FormValues>) => {
      try {
        formikProps.setSubmitting(true)
        const res = await editTopic(route.params.id, values)
        alert.show({ type: 'success', message: '主题更新成功' })
        mutate([`/page/t/:id/topic.json`, route.params.id], res.data)
        formSwr.mutate(null, { revalidate: false })
        navigation.goBack()
      } catch (err) {
        alert.show({ type: 'error', message: err.message })
      }
    },
    [],
  )

  if (formSwr.error) {
    return (
      <View className="flex flex-row justify-center py-8">
        <Text style={styles.text}>{formSwr.error.message}</Text>
      </View>
    )
  }

  if (!formSwr.data) {
    return (
      <View className="flex flex-row justify-center py-8">
        <Loader />
      </View>
    )
  }

  return (
    <View className="flex-1" style={styles.layer1}>
      <KeyboardAwareView
        animated
        style={{
          height: '100%',
        }}>
        <Formik
          initialValues={formSwr.data.values}
          onSubmit={handleSubmit}
          enableReinitialize>
          {(formikProps) => (
            <ScrollView
              style={styles.layer1}
              className="flex-1"
              ref={scrollViewRef}
              scrollEventThrottle={16}>
              <View className="py-3 px-2 flex-1">
                <TextField name="title" label="标题" />
                <SelectField
                  name="syntax"
                  label="内容类型"
                  options={formSwr.data.schema.syntaxOptions}
                />
                <TextField
                  name="content"
                  label="内容"
                  placeholder="正文内容"
                  multiline
                  inputStyle={{ minHeight: 200 }}
                />
                <Button
                  className="mt-4"
                  size="md"
                  variant="primary"
                  label="更新"
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
