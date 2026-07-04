import { useCallback } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { Formik, FormikHelpers } from 'formik'

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

  const fetchSocialSetting = useCallback(async () => {
    const res = await fetchSocialForm()
    return res.data
  }, [])

  const queryClient = useQueryClient()

  const socialQuery = useQuery({
    queryKey: [`/member/${props.username}/social.json`],
    queryFn: fetchSocialSetting,
    refetchOnMount: true,
    enabled: props.isActive,
    staleTime: 0,
  })

  const handleSubmit = useCallback(
    async (values: FormValues, formikProps: FormikHelpers<FormValues>) => {
      formikProps.setSubmitting(true)
      try {
        const res = await updateSocial(values)
        queryClient.setQueryData(
          [`/member/${props.username}/social.json`],
          res.data,
        )
        alert.show({ type: 'success', message: '社交帐号已更新' })
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
      initialValues={socialQuery.data?.values || {}}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {(formikProps) => (
        <ScrollView
          refreshControl={
            <MyRefreshControl
              refreshing={socialQuery.isRefetching}
              onRefresh={() => {
                if (!socialQuery.isRefetching && !formikProps.isSubmitting) {
                  socialQuery.refetch()
                }
              }}
            />
          }
        >
          <MaxWidthWrapper style={socialStyles.wrapper}>
            {socialQuery.data && (
              <GroupWapper
                innerStyle={styles.layer1}
                style={socialQuery.isRefetching && { opacity: 0.4 }}
                pointerEvents={socialQuery.isRefetching ? 'none' : 'auto'}
              >
                <View style={socialStyles.formContainer}>
                  {socialQuery.data.fields.map((field) => (
                    <View style={socialStyles.fieldRow} key={field.name}>
                      <Image
                        source={{ uri: field.image }}
                        style={{ width: 28, height: 28, marginRight: 12 }}
                      />
                      <View style={socialStyles.inputCol}>
                        <TextField
                          placeholder={field.label}
                          name={field.name}
                          label={false}
                        />
                      </View>
                    </View>
                  ))}
                  <Button
                    style={socialStyles.btnMargin}
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
              </GroupWapper>
            )}
          </MaxWidthWrapper>
        </ScrollView>
      )}
    </Formik>
  )
}

const socialStyles = StyleSheet.create({
  wrapper: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  formContainer: {
    padding: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputCol: {
    flex: 1,
  },
  btnMargin: {
    marginVertical: 8,
  },
})
