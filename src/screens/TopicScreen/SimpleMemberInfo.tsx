import { useCallback } from 'react'
import { Text, View } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Image } from 'expo-image'
import useSWR from 'swr'

import Button from '@/components/Button'
import { Box } from '@/components/Skeleton/Elements'
import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { localTime } from '@/utils/time'
import {
  blockMember,
  getMemberDetail,
  unblockMember,
} from '@/utils/v2ex-client'
import { MemberDetail, StatusResponse } from '@/utils/v2ex-client/types'

const AVATAR_SIZE = 48

export default function SimpleMemberInfo(props: {
  username: string
  navigation: NativeStackNavigationProp<AppStackParamList>
  currentUser: MemberDetail
}) {
  const { username, navigation, currentUser } = props
  const { styles } = useTheme()
  const memberSwr = useSWR(
    [`/page/member/:username/info.json`, username],
    async ([_, username]) => {
      const { data } = await getMemberDetail({ username })
      return data
    },
    {
      onErrorRetry(err) {
        if (err.response?.status === 404) {
          return
        }
      },
    },
  )
  const alert = useAlertService()

  const handleBlockToggle = useCallback(() => {
    const { data } = memberSwr
    if (!data) {
      return
    }
    let promise: Promise<StatusResponse<Pick<MemberDetail, 'meta'>>>
    let successMsg: string
    if (data.meta?.blocked) {
      promise = unblockMember({ id: data.id })
      successMsg = '成功取消用户屏蔽'
    } else {
      promise = blockMember({ id: data.id })
      successMsg = '成功屏蔽用户'
    }
    const indicator = alert.show({
      type: 'default',
      message: '处理中',
      loading: true,
      duration: 0,
    })
    promise
      .then(({ data: patch }) => {
        // notice
        alert.show({
          type: 'success',
          message: successMsg,
        })
        memberSwr.mutate(
          (prev) => ({
            ...prev,
            meta: patch.meta,
          }),
          false,
        )
      })
      .catch((err) => {
        alert.show({ type: 'error', message: err.message })
      })
      .finally(() => {
        alert.hide(indicator)
      })
  }, [memberSwr.data, memberSwr.mutate])

  const { data } = memberSwr

  return (
    <View className="px-2 pt-1 pb-3" style={styles.border_b_light}>
      <View className="flex flex-row">
        <View className="flex-1">
          <Button
            className="flex-row"
            onPress={() => {
              navigation.navigate('member', {
                username,
              })
            }}>
            <View className="mr-3">
              {data?.avatar_large ? (
                <Image
                  className="w-full h-full rounded-md"
                  style={[
                    {
                      width: AVATAR_SIZE,
                      height: AVATAR_SIZE,
                    },
                    styles.layer2,
                  ]}
                  source={{ uri: data.avatar_large }}
                />
              ) : (
                <Box
                  className="rounded-md"
                  style={[
                    {
                      width: AVATAR_SIZE,
                      height: AVATAR_SIZE,
                    },
                    styles.layer2,
                  ]}
                />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold" style={styles.text_primary}>
                {username}
              </Text>
              <Text className="text-sm" style={styles.text_meta}>
                <Text className="pl-2 mb-1">
                  {data?.created
                    ? `${localTime(data.created * 1000)} 加入`
                    : ''}
                </Text>
              </Text>
            </View>
          </Button>
        </View>
        <View className="flex flex-col justify-center">
          <View className="flex flex-row">
            {data && currentUser && username !== currentUser.username && (
              <Button
                size="sm"
                variant="default"
                onPress={handleBlockToggle}
                label={data.meta?.blocked ? '已屏蔽' : '屏蔽'}></Button>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}
