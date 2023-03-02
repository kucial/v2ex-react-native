import { useCallback } from 'react'
import { ImageBackground, Pressable, Text, View } from 'react-native'
import { EllipsisHorizontalIcon } from 'react-native-heroicons/outline'
import { useActionSheet } from '@expo/react-native-action-sheet'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import classNames from 'classnames'
import Constants from 'expo-constants'
import { Image } from 'expo-image'
import { SWRResponse } from 'swr'

import BackButton from '@/components/BackButton'
import { Box } from '@/components/Skeleton/Elements'
import { useActivityIndicator } from '@/containers/ActivityIndicator'
import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { localTime } from '@/utils/time'
import * as v2exClient from '@/utils/v2ex-client'
import { MemberDetail } from '@/utils/v2ex-client/types'
import { StatusResponse } from '@/utils/v2ex-client/types'

const AVATAR_SIZE = 72
const HEADER_CANVAS_HEIGHT = 64

export default function MemberScreenHeader({
  route,
  navigation,
  swr,
}: NativeStackScreenProps<AppStackParamList, 'member'> & {
  swr: SWRResponse
}) {
  const { brief, username } = route.params
  const data = swr.data || brief || { username }
  const { showActionSheetWithOptions } = useActionSheet()
  const { theme, styles } = useTheme()
  const tintColor = theme.colors.primary
  const alert = useAlertService()
  const aIndicator = useActivityIndicator()
  const openActionSheet = useCallback(() => {
    const options = [
      '取消',
      data.meta?.watched ? '取消特别关注' : '加入特别关注',
      data.meta?.blocked ? '取消拉黑' : '拉黑',
    ]
    showActionSheetWithOptions(
      {
        title: data.username,
        options,
        cancelButtonIndex: 0,
        destructiveButtonIndex: 2,
      },
      (buttonIndex) => {
        const KEY = `member-action-button-${buttonIndex}`
        let promise: Promise<StatusResponse<Pick<MemberDetail, 'meta'>>>

        if (buttonIndex === 1) {
          if (data.meta?.watched) {
            promise = v2exClient.unwatchMember({ id: data.id })
          } else {
            promise = v2exClient.watchMember({ id: data.id })
          }
        }
        if (buttonIndex === 2) {
          if (data.meta?.blocked) {
            promise = v2exClient.unblockMember({ id: data.id })
          } else {
            promise = v2exClient.blockMember({ id: data.id })
          }
        }
        if (promise) {
          aIndicator.show(KEY)
          promise
            .then(({ data: patch }) => {
              // notice
              alert.alertWithType(
                'success',
                '成功',
                `${options[buttonIndex]} ${data.username}`,
              )
              swr.mutate(
                (prev) => ({
                  ...prev,
                  meta: patch.meta,
                }),
                false,
              )
            })
            .catch((err) => {
              alert.alertWithType('error', '错误', err.message)
            })
            .finally(() => {
              aIndicator.hide(KEY)
            })
        }
      },
    )
  }, [data.meta?.blocked, data.meta?.watched, data.username])

  return (
    <View className="w-full" style={styles.layer1}>
      <View
        style={{
          position: 'absolute',
          left: 6,
          top: Constants.statusBarHeight,
          zIndex: 10,
        }}>
        <BackButton
          tintColor={tintColor}
          onPress={() => {
            navigation.goBack()
          }}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          right: 6,
          top: Constants.statusBarHeight,
          zIndex: 10,
        }}>
        <Pressable
          className="w-[44px] h-[44px] rounded-full items-center justify-center active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
          onPress={openActionSheet}>
          <EllipsisHorizontalIcon size={24} color={tintColor} />
        </Pressable>
      </View>
      <View className="relative">
        <View
          className="flex flex-row items-end"
          style={[
            {
              height: Constants.statusBarHeight + HEADER_CANVAS_HEIGHT,
            },
            styles.layer1,
          ]}>
          <ImageBackground
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            source={{ uri: data.avatar_large }}
            resizeMode="cover"
            blurRadius={10}
          />
          {/* <View
            style={{
              marginLeft: AVATAR_SIZE + 16 + 12,
            }}>
            <OutlinedText
              text={data.username}
              width={200}
              height={40}
              fontSize={18}
              color="#111111"
              outlineColor="#ffffff50"
            />
          </View> */}
        </View>
        <View
          className="absolute"
          style={{
            left: 16,
            bottom: -AVATAR_SIZE * 0.7,
          }}>
          {data.avatar_large ? (
            <Image
              className="w-full h-full rounded-full"
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderWidth: 3,
                borderColor: theme.colors.bg_layer1,
                backgroundColor: theme.colors.text_placeholder,
              }}
              source={{ uri: data.avatar_large }}
            />
          ) : (
            <Box
              className="rounded-full bg-white"
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
              }}
            />
          )}
        </View>
      </View>
      <View
        className="flex flex-row"
        style={{
          marginLeft: AVATAR_SIZE + 16 + 12,
          minHeight: AVATAR_SIZE * 0.7,
        }}>
        <View className="flex-1">
          <Text className="text-lg font-bold" style={styles.text_primary}>
            {data.username}
          </Text>
          <Text className="text-sm" style={styles.text_meta}>
            <Text className="pl-2 mb-1">
              {data.created ? `${localTime(data.created * 1000)} 加入` : ''}
            </Text>
          </Text>
        </View>
        <View className="flex flex-col justify-center pr-1">
          <Pressable
            onPress={() => {
              navigation.navigate('member-info', {
                username: data.username,
              })
            }}
            className={classNames(
              'h-[44px] px-4 flex flex-row items-center rounded-full',
              'active:opacity-60 active:bg-neutral-100 dark:active:bg-neutral-600',
            )}>
            <Text style={styles.text}>更多</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
