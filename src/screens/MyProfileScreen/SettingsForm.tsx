import { useCallback } from 'react'
import { View } from 'react-native'
import { Formik, FormikHelpers } from 'formik'
import useSWR from 'swr'

import Button from '@/components/Button'
import { TextField } from '@/components/formik'
import GroupWapper from '@/components/GroupWrapper'
import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { fetchSettingsForm, updateSettings } from '@/utils/v2ex-client'

export default function SettingsForm(props: { username: string }) {
  const { styles } = useTheme()
  const alert = useAlertService()

  const settingsSwr = useSWR(
    `/member/${props.username}/settings.json`,
    async () => {
      const res = await fetchSettingsForm()
      return res.data
    },
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    },
  )

  const handleSubmit = useCallback(
    async (values, formikProps: FormikHelpers<any>) => {
      formikProps.setSubmitting(true)
      try {
        const res = await updateSettings(values)
        settingsSwr.mutate(res.data, { revalidate: false })
        alert.alertWithType('success', '成功', '用户信息已更新')
      } catch (err) {
        alert.alertWithType('error', '错误', err.message)
      } finally {
        formikProps.setSubmitting(false)
      }
    },
    [settingsSwr],
  )

  return (
    <Formik
      initialValues={settingsSwr.data || {}}
      onSubmit={handleSubmit}
      enableReinitialize>
      {(formikProps) => (
        <GroupWapper
          innerStyle={styles.layer1}
          style={settingsSwr.isValidating && { opacity: 0.4 }}
          pointerEvents={settingsSwr.isValidating ? 'none' : 'auto'}>
          <View className="p-3">
            <TextField
              className="mb-2"
              name="website"
              label="个人网站"
              placeholder="个人网站"
            />
            <View className="-mx-2 flex flex-row mb-2">
              <View className="px-2 flex-1">
                <TextField
                  name="company"
                  label="所在公司"
                  placeholder="所在公司"
                />
              </View>
              <View className="px-2 flex-1">
                <TextField
                  name="company_title"
                  label="工作职位"
                  placeholder="工作职位"
                />
              </View>
            </View>

            <TextField
              className="mb-2"
              name="location"
              label="所在地"
              placeholder="所在地"
            />
            <TextField
              className="mb-2"
              name="tagline"
              label="签名"
              placeholder="签名"
            />
            <TextField
              className="mb-2"
              name="bio"
              label="个人简介"
              placeholder="个人简介"
              multiline
              inputStyle={{ height: 140 }}
            />
            <View className="mt-4 mb-2">
              <Button
                label="提交"
                loading={formikProps.isSubmitting}
                onPress={() => {
                  formikProps.handleSubmit()
                }}
              />
            </View>
          </View>
        </GroupWapper>
      )}
    </Formik>
  )
}
