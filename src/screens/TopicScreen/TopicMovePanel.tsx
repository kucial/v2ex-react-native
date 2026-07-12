import { useCallback } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import Button from '@/components/Button'
import { NodeSelectField, TextField } from '@/components/form'

import { useAlertService } from '@/containers/AlertService'
import { AlertService } from '@/containers/AlertService/types'
import { moveTopic } from '@/utils/v2ex-client'
import ApiError from '@/utils/v2ex-client/ApiError'
import { NodeBasic, TopicDetail } from '@/utils/v2ex-client/types'

const TopicMoveSchema = z.object({
  node: z.any().refine((val) => val !== null && val !== undefined, {
    message: '请选择新的节点',
  }),
  memo: z.string().optional().default(''),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(TopicMoveSchema),
    defaultValues: {
      node: null,
      memo: '',
    },
    mode: 'onChange',
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        if (values.node) {
          const response = await moveTopic(topicId, {
            destination: values.node.name,
            memo: values.memo || '',
          })
          if (response?.data) {
            onUpdated(response.data as TopicDetail)
          }
        }
      } catch (err) {
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
      <FormProvider {...form}>
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
              loading={isSubmitting}
              disabled={isSubmitting}
              onPress={() => {
                handleSubmit(onSubmit)()
              }}
            />
          </View>
        </View>
      </FormProvider>
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
