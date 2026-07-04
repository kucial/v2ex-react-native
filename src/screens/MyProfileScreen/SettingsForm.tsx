import { useCallback } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Formik, FormikHelpers } from 'formik'

import Button from '@/components/Button'
import { TextField } from '@/components/formik'
import GroupWapper from '@/components/GroupWrapper'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import MyRefreshControl from '@/components/MyRefreshControl'

import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { fetchSettingsForm, updateSettings } from '@/utils/v2ex-client'

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

  const handleSubmit = useCallback(
    async (values, formikProps: FormikHelpers<any>) => {
      formikProps.setSubmitting(true)
      try {
        const res = await updateSettings(values)
        queryClient.setQueryData(
          [`/member/${props.username}/settings.json`],
          res.data,
        )
        alert.show({ type: 'success', message: '用户信息已更新' })
      } catch (err) {
        alert.show({ type: 'error', message: err.message })
      } finally {
        formikProps.setSubmitting(false)
      }
    },
    [props.username, queryClient, alert],
  )

  return (
    <Formik
      initialValues={settingsQuery.data || {}}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {(formikProps) => (
        <ScrollView
          refreshControl={
            <MyRefreshControl
              refreshing={settingsQuery.isRefetching}
              onRefresh={() => {
                if (!settingsQuery.isRefetching && !formikProps.isSubmitting) {
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
                    loading={formikProps.isSubmitting}
                    disabled={formikProps.isSubmitting}
                    onPress={() => {
                      formikProps.handleSubmit()
                    }}
                  />
                </View>
              </View>
            </GroupWapper>
          </MaxWidthWrapper>
        </ScrollView>
      )}
    </Formik>
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
