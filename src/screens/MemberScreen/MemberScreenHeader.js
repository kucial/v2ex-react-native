import { useCallback } from 'react'
import { ImageBackground, Pressable, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { EllipsisHorizontalIcon } from 'react-native-heroicons/outline'
import { useActionSheet } from '@expo/react-native-action-sheet'
import Constants from 'expo-constants'
import colors from 'tailwindcss/colors'
import { useTailwind } from 'tailwindcss-react-native'

import BackButton from '@/components/BackButton'
import OutlinedText from '@/components/OutlinedText'
import { Box } from '@/components/Skeleton/Elements'
import { useActivityIndicator } from '@/containers/ActivityIndicator'
import { useAlertService } from '@/containers/AlertService'
import fetcher from '@/utils/fetcher'
import { localTime } from '@/utils/time'

const AVATAR_SIZE = 68
const HEADER_CANVAS_HEIGHT = 80

export default function MemberScreenHeader({ route, navigation, swr }) {
  const { brief, username } = route.params
  const data = swr.data || brief || { username }
  const { showActionSheetWithOptions } = useActionSheet()
  const tw = useTailwind()
  const { color: tintColor } = tw('color-neutral-900 dark:text-neutral-300')
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
        let promise

        if (buttonIndex === 1) {
          if (data.meta?.watched) {
            promise = fetcher(`/page/member/${data.username}/unwatch.json`)
          } else {
            promise = fetcher(`/page/member/${data.username}/watch.json`)
          }
        }
        if (buttonIndex === 2) {
          if (data.meta?.blocked) {
            promise = fetcher(`/page/member/${data.username}/unblock.json`)
          } else {
            promise = fetcher(`/page/member/${data.username}/block.json`)
          }
        }
        if (promise) {
          aIndicator.show()
          promise
            .then((meta) => {
              // notice
              alert.alertWithType(
                'success',
                '成功',
                `${options[buttonIndex]} ${data.username}`,
              )
              swr.mutate(
                (prev) => ({
                  ...prev,
                  meta,
                }),
                false,
              )
            })
            .catch((err) => {
              console.log(err)
              alert.alertWithType('error', '错误', err.message)
            })
            .finally(() => {
              aIndicator.hide()
            })
        }
      },
    )
  }, [data.meta?.blocked, data.meta?.watched, data.username])

  return (
    <View className="bg-white w-full dark:bg-neutral-900">
      <View
        style={{
          position: 'absolute',
          left: 6,
          top: Constants.statusBarHeight,
          zIndex: 10,
        }}>
        <BackButton
          tintColor={colors.neutral[900]}
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
          className="bg-neutral-100 dark:bg-neutral-900 flex flex-row items-end"
          style={{
            height: Constants.statusBarHeight + HEADER_CANVAS_HEIGHT,
          }}>
          <ImageBackground
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            source={{ uri: data.avatar_large }}
            resizeMode="cover"
            blurRadius={10}
          />
          <View
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
          </View>
        </View>
        <View
          className="absolute"
          style={{
            left: 16,
            bottom: -AVATAR_SIZE / 2,
          }}>
          {data.avatar_large ? (
            <FastImage
              className="w-full h-full rounded-full bg-white border-white dark:border-neutral-900"
              style={{
                width: AVATAR_SIZE,
                height: AVATAR_SIZE,
                borderWidth: 3,
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
        style={{
          marginLeft: AVATAR_SIZE + 16 + 12,
          minHeight: AVATAR_SIZE / 2,
          paddingVertical: 4,
        }}>
        <Text className="text-neutral-500 text-sm">
          <Text className="pl-2 mb-1">
            {[
              data.created ? `${localTime(data.created * 1000)} 加入` : '',
              data.tagline,
              data.location,
              data.bio,
              data.website,
            ]
              .filter(Boolean)
              .join('; ')}
          </Text>
        </Text>
      </View>
    </View>
  )
}
