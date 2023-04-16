import { useCallback, useMemo } from 'react'
import { KeyboardAvoidingView, SafeAreaView, Text, View } from 'react-native'
import { Formik, FormikHelpers, useField } from 'formik'
import * as Yup from 'yup'

import Button from '@/components/Button'
import { NodeSelectField, TextField } from '@/components/formik'
import { useAlertService } from '@/containers/AlertService'
import { moveTopic } from '@/utils/v2ex-client'
import { NodeBasic, TopicDetail } from '@/utils/v2ex-client/types'

const TopicMoveSchema = Yup.object().shape({
  node: Yup.object().nullable().required('请选择新的节点'),
})

type FormValues = {
  node: NodeBasic | null
  memo: string
}

export default function TopicMovePanel(props: {
  topicId: number
  node: NodeBasic
  onExit(): void
  onUpdated(topic: TopicDetail): void
}) {
  const alert = useAlertService()
  const initialValues = useMemo(
    () => ({
      node: null,
      memo: '',
    }),
    [],
  )
  const handleSubmit = useCallback(
    async (values: FormValues, formikProps: FormikHelpers<FormValues>) => {
      try {
        formikProps.setSubmitting(true)
        const { data: topic } = await moveTopic(props.topicId, {
          destination: values.node.name,
          memo: values.memo,
        })
        formikProps.setSubmitting(false)
        props.onUpdated(topic)
      } catch (err) {
        formikProps.setSubmitting(false)
        alert.alertWithType({ type: 'error', message: err.message })
        if (err.code === 'EDIT_NOT_ALLOWED') {
          props.onExit()
        }
      }
    },
    [props.topicId],
  )

  return (
    <KeyboardAvoidingView>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={TopicMoveSchema}>
        {(formikProps) => (
          <View className="p-3 pb-5">
            <NodeSelectField
              className="mb-2"
              name="node"
              label="节点"
              placeholder={`当前节点: ${props.node.name}`}
            />
            <TextField
              name="memo"
              label="备注"
              placeholder="备注"
              bottomSheet
            />
            <View className="mt-7 mb-2">
              <Button
                label="确认"
                loading={formikProps.isSubmitting}
                onPress={() => {
                  formikProps.handleSubmit()
                }}
              />
              {/* <Button
                className="mt-4"
                label="取消"
                variant="secondary"
                onPress={() => {
                  props.onExit()
                }}
              /> */}
            </View>
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  )
}
