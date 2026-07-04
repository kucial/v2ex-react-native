import { useCallback, useMemo } from 'react'
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native'
import { Formik, FormikHelpers } from 'formik'
import * as Yup from 'yup'

import Button from '@/components/Button'
import { NodeSelectField, TextField } from '@/components/formik'

import { useAlertService } from '@/containers/AlertService'
import { AlertService } from '@/containers/AlertService/types'
import { moveTopic } from '@/utils/v2ex-client'
import ApiError from '@/utils/v2ex-client/ApiError'
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
  const { topicId, node, onExit, onUpdated } = props
  const alert = useAlertService() as AlertService
  const initialValues = useMemo(
    (): FormValues => ({
      node: null,
      memo: '',
    }),
    [],
  )
  const handleSubmit = useCallback(
    async (values: FormValues, formikProps: FormikHelpers<FormValues>) => {
      try {
        formikProps.setSubmitting(true)
        if (values.node) {
          const response = await moveTopic(topicId, {
            destination: values.node.name,
            memo: values.memo,
          })
          formikProps.setSubmitting(false)
          if (response?.data) {
            onUpdated(response.data as TopicDetail)
          }
        }
      } catch (err) {
        formikProps.setSubmitting(false)
        alert.show({
          type: 'error',
          message: err instanceof Error ? err.message : String(err),
        })
        if (err instanceof ApiError && err.code === 'EDIT_NOT_ALLOWED') {
          onExit()
        }
      }
    },
    [topicId, onUpdated, onExit, alert],
  )

  return (
    <KeyboardAvoidingView>
      <Formik<FormValues>
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validationSchema={TopicMoveSchema}
      >
        {(formikProps) => (
          <View style={topicMoveStyles.container}>
            <NodeSelectField
              style={topicMoveStyles.mb2}
              name='node'
              label='节点'
              placeholder={`当前节点: ${node.name}`}
            />
            <TextField name='memo' label='备注' placeholder='备注' />
            <View style={topicMoveStyles.btnWrap}>
              <Button
                variant='primary'
                size='md'
                label='确认'
                loading={formikProps.isSubmitting}
                disabled={formikProps.isSubmitting}
                onPress={() => {
                  formikProps.handleSubmit()
                }}
              />
            </View>
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  )
}

const topicMoveStyles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 20,
  },
  mb2: {
    marginBottom: 8,
  },
  btnWrap: {
    marginTop: 28,
    marginBottom: 8,
  },
})
