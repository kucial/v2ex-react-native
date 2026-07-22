import { useCallback, useRef } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { z } from 'zod'

import Button from '@/components/Button'
import { SelectField, TextField } from '@/components/form'
import KeyboardAwareView from '@/components/KeyboardAwareView'
import Loader from '@/components/Loader'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import NavigationHeader from '@/components/NavigationHeader'

import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { editTopic, fetchTopicEditForm } from '@/utils/v2ex-client'

const TopicEditSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  syntax: z.enum(['0', '1']),
  content: z.string(),
})

type FormValues = z.infer<typeof TopicEditSchema>

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
    const res = await fetchTopicEditForm(topicId)
    return res.data
  }, [topicId])

  const formQuery = useQuery({
    queryKey: ['/t/:id/edit', topicId],
    queryFn: fetchFormData,
    refetchOnMount: true,
    gcTime: 0,
    staleTime: 0,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(TopicEditSchema),
    defaultValues: {
      title: '',
      syntax: '0',
      content: '',
    },
    values: formQuery.data
      ? {
          title: formQuery.data.values.title,
          syntax: formQuery.data.values.syntax === '1' ? '1' : '0',
          content: formQuery.data.values.content,
        }
      : undefined,
    mode: 'onChange',
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        const res = await editTopic(topicId, {
          ...values,
          syntax: Number(values.syntax) as 0 | 1,
        })
        alert.show({ type: 'success', message: '主题更新成功' })
        router.back()
        queryClient.setQueryData([`/page/t/:id/topic.json`, topicId], res.data)
        queryClient.setQueryData(['/t/:id/edit', topicId], undefined)
      } catch (err: any) {
        alert.show({ type: 'error', message: err.message })
      }
    },
    [alert, queryClient, router, topicId],
  )

  if (formQuery.error) {
    return (
      <View style={[editStyles.container, styles.layer1]}>
        <NavigationHeader canGoBack title='编辑主题' />
        <View style={editStyles.centerPy8}>
          <Text style={styles.text}>{formQuery.error.message}</Text>
        </View>
      </View>
    )
  }

  if (!formQuery.data) {
    return (
      <View style={[editStyles.container, styles.layer1]}>
        <NavigationHeader canGoBack title='编辑主题' />
        <View style={editStyles.centerPy8}>
          <Loader />
        </View>
      </View>
    )
  }

  return (
    <View style={[editStyles.container, styles.layer1]}>
      <NavigationHeader canGoBack title='编辑主题' />
      <KeyboardAwareView animated style={editStyles.kav}>
        <FormProvider {...form}>
          <ScrollView
            style={[editStyles.container, styles.layer1]}
            ref={scrollViewRef}
            scrollEventThrottle={16}
          >
            <MaxWidthWrapper>
              <View style={editStyles.formWrap}>
                <TextField name='title' label='标题' />
                <SelectField
                  name='syntax'
                  label='内容类型'
                  options={formQuery.data.schema.syntaxOptions.map(
                    (option) => ({
                      label: option.label,
                      value: option.value ?? '',
                    }),
                  )}
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
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  onPress={() => {
                    handleSubmit(onSubmit)()
                  }}
                />
              </View>
            </MaxWidthWrapper>
          </ScrollView>
        </FormProvider>
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
