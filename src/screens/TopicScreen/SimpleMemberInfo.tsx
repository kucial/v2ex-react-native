import { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

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
  currentUser: MemberDetail
}) {
  const { username, currentUser } = props
  const { styles } = useTheme()
  const router = useRouter()
  const fetchMemberDetail = useCallback(async () => {
    const { data } = await getMemberDetail({ username })
    return data
  }, [username])

  const queryClient = useQueryClient()
  const memberQuery = useQuery({
    queryKey: [`/page/member/:username/info.json`, username],
    queryFn: fetchMemberDetail,
  })
  const alert = useAlertService()

  const handleBlockToggle = useCallback(() => {
    const { data } = memberQuery
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
        queryClient.setQueryData(
          [`/page/member/:username/info.json`, username],
          {
            ...memberQuery.data,
            meta: patch.meta,
          },
        )
      })
      .catch((err) => {
        alert.show({ type: 'error', message: err.message })
      })
      .finally(() => {
        alert.hide(indicator)
      })
  }, [memberQuery, alert, queryClient, username])

  const { data } = memberQuery

  return (
    <View style={[simpleMemberStyles.container, styles.border_b_light]}>
      <View style={simpleMemberStyles.row}>
        <View style={simpleMemberStyles.flex1}>
          <Button
            style={simpleMemberStyles.row}
            onPress={() => {
              router.push({
                pathname: '/member/[username]',
                params: {
                  username,
                },
              })
            }}
          >
            <View style={simpleMemberStyles.avatarWrap}>
              {data?.avatar_large ? (
                <Image
                  style={[simpleMemberStyles.avatar, styles.layer2]}
                  source={{ uri: data.avatar_large }}
                />
              ) : (
                <Box
                  style={[simpleMemberStyles.avatar, styles.layer2]}
                />
              )}
            </View>
            <View style={simpleMemberStyles.flex1}>
              <Text
                style={[
                  simpleMemberStyles.bold,
                  styles.text_primary,
                  styles.text_lg,
                ]}
              >
                {username}
              </Text>
              <Text style={[styles.text_meta, styles.text_sm]}>
                <Text style={simpleMemberStyles.joinedText}>
                  {data?.created
                    ? `${localTime(data.created * 1000)} 加入`
                    : ''}
                </Text>
              </Text>
            </View>
          </Button>
        </View>
        <View style={simpleMemberStyles.rightCol}>
          <View style={simpleMemberStyles.row}>
            {data && currentUser && username !== currentUser.username && (
              <Button
                size='sm'
                variant='default'
                onPress={handleBlockToggle}
                label={data.meta?.blocked ? '已屏蔽' : '屏蔽'}
              ></Button>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

const simpleMemberStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  avatarWrap: {
    marginRight: 12,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 6,
  },
  bold: {
    fontWeight: 'bold',
  },
  joinedText: {
    paddingLeft: 8,
    marginBottom: 4,
  },
  rightCol: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
})
