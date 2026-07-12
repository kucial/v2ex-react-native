import { useCallback } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ScrollView, StyleSheet, View } from 'react-native'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import Button from '@/components/Button'
import { TextField } from '@/components/form'
import GroupWapper from '@/components/GroupWrapper'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import MyRefreshControl from '@/components/MyRefreshControl'

import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { fetchSettingsForm, updateSettings } from '@/utils/v2ex-client'

const SettingsSchema = z.record(z.any())

export default function SettingsForm(props: {
  username: string
  isActive: boolean
}) {
  const { styles } = useTheme()
  const alert = useAlertService()

  const fetchSettings = useCallback(async () => {
    const res = await fetchSettingsForm()
    return res.data
  }, [])

  const settingsQuery = useQuery({
    queryKey: [`/member/${props.username}/settings.json`],
    queryFn: fetchSettings,
    enabled: props.isActive,
    refetchOnMount: true,
    staleTime: 0,
  })

  const queryClient = useQueryClient()

  const form = useForm<any>({
    resolver: zodResolver(SettingsSchema),
    values: settingsQuery.data || {},
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = useCallback(
    async (values: any) => {
      try {
        const res = await updateSettings(values)
        queryClient.setQueryData(
          [`/member/${props.username}/settings.json`],
          res.data,
        )
        alert.show({ type: 'success', message: '用户信息已更新' })
      } catch (err: any) {
        alert.show({ type: 'error', message: err.message })
      }
    },
    [props.username, queryClient, alert],
  )

  return (
    <FormProvider {...form}>
      <ScrollView
        refreshControl={
          <MyRefreshControl
            refreshing={settingsQuery.isRefetching}
            onRefresh={() => {
              if (!settingsQuery.isRefetching && !isSubmitting) {
                settingsQuery.refetch()
              }
            }}
          />
        }
      >
        <MaxWidthWrapper style={settingsStyles.wrapper}>
          <GroupWapper
            innerStyle={styles.layer1}
            style={settingsQuery.isRefetching && { opacity: 0.4 }}
            pointerEvents={settingsQuery.isRefetching ? 'none' : 'auto'}
          >
            <View style={settingsStyles.formContainer}>
              <TextField
                style={settingsStyles.fieldMargin}
                name='website'
                label='个人网站'
                placeholder='个人网站'
              />
              <View style={settingsStyles.row}>
                <View style={settingsStyles.col}>
                  <TextField
                    name='company'
                    label='所在公司'
                    placeholder='所在公司'
                  />
                </View>
                <View style={settingsStyles.col}>
                  <TextField
                    name='company_title'
                    label='工作职位'
                    placeholder='工作职位'
                  />
                </View>
              </View>

              <TextField
                style={settingsStyles.fieldMargin}
                name='location'
                label='所在地'
                placeholder='所在地'
              />
              <TextField
                style={settingsStyles.fieldMargin}
                name='tagline'
                label='签名'
                placeholder='签名'
              />
              <TextField
                style={settingsStyles.fieldMargin}
                name='bio'
                label='个人简介'
                placeholder='个人简介'
                multiline
                inputStyle={{ height: 140 }}
              />
              <View style={settingsStyles.btnContainer}>
                <Button
                  variant='primary'
                  size='md'
                  label='提交'
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  onPress={() => {
                    handleSubmit(onSubmit)()
                  }}
                />
              </View>
            </View>
          </GroupWapper>
        </MaxWidthWrapper>
      </ScrollView>
    </FormProvider>
  )
}

const settingsStyles = StyleSheet.create({
  wrapper: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  formContainer: {
    padding: 12,
  },
  fieldMargin: {
    marginBottom: 8,
  },
  row: {
    marginHorizontal: -8,
    flexDirection: 'row',
    marginBottom: 8,
  },
  col: {
    paddingHorizontal: 8,
    flex: 1,
  },
  btnContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
})
