import { useCallback } from 'react'
import { SafeAreaView, ScrollView, View } from 'react-native'
import { Image } from 'expo-image'
import { Formik, FormikHelpers } from 'formik'
import useSWR from 'swr'

import Button from '@/components/Button'
import { TextField } from '@/components/formik'
import GroupWapper from '@/components/GroupWrapper'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import MyRefreshControl from '@/components/MyRefreshControl'
import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { fetchSocialForm, updateSocial } from '@/utils/v2ex-client'

type FormValues = {
  member_dribbble: string
  member_nintendo_friend_code: string
  member_duolingo: string
  member_aboutme: string
  member_lastfm: string
  member_goodreads: string
  member_github: string
  member_psn: string
  member_steam: string
  member_twitch: string
  member_battletag: string
  member_instagram: string
  member_telegram: string
  member_nostr_npub: string
  member_twitter: string
  member_btc: string
  social_coding: string
}

export default function SocialForm(props: {
  username: string
  isActive?: boolean
}) {
  const { styles } = useTheme()
  const alert = useAlertService()

  const socialSwr = useSWR(
    props.isActive ? `/member/${props.username}/social.json` : null,
    async () => {
      const res = await fetchSocialForm()
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
    async (values: FormValues, formikProps: FormikHelpers<FormValues>) => {
      formikProps.setSubmitting(true)
      try {
        const res = await updateSocial(values)
        socialSwr.mutate(
          (prev) => ({
            ...prev,
            values: res.data,
          }),
          { revalidate: false },
        )
        alert.show({ type: 'success', message: '社交帐号已更新' })
      } catch (err) {
        alert.show({ type: 'error', message: err.message })
      } finally {
        formikProps.setSubmitting(false)
      }
    },
    [socialSwr],
  )

  return (
    <Formik
      initialValues={socialSwr.data?.values || {}}
      onSubmit={handleSubmit}
      enableReinitialize>
      {(formikProps) => (
        <ScrollView
          refreshControl={
            <MyRefreshControl
              refreshing={socialSwr.isValidating}
              onRefresh={() => {
                if (!socialSwr.isValidating && !formikProps.isSubmitting) {
                  socialSwr.mutate()
                }
              }}
            />
          }>
          <MaxWidthWrapper className="py-4 px-2 mb-4">
            {socialSwr.data && (
              <GroupWapper
                innerStyle={styles.layer1}
                style={socialSwr.isValidating && { opacity: 0.4 }}
                pointerEvents={socialSwr.isValidating ? 'none' : 'auto'}>
                <View className="p-3">
                  {socialSwr.data.fields.map((field) => (
                    <View
                      className="flex flex-row items-center mb-2"
                      key={field.name}>
                      <Image
                        source={{ uri: field.image }}
                        style={{ width: 28, height: 28, marginRight: 12 }}
                      />
                      <View className="flex-1">
                        <TextField
                          placeholder={field.label}
                          name={field.name}
                          label={false}
                        />
                      </View>
                    </View>
                  ))}
                  <Button
                    className="my-2"
                    variant="primary"
                    size="md"
                    label="提交"
                    loading={formikProps.isSubmitting}
                    disabled={formikProps.isSubmitting}
                    onPress={() => {
                      formikProps.handleSubmit()
                    }}
                  />
                </View>
              </GroupWapper>
            )}
          </MaxWidthWrapper>
        </ScrollView>
      )}
    </Formik>
  )
}
