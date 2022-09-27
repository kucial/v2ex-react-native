import { View, Text, Alert } from 'react-native'
import React from 'react'
import { Pressable } from 'react-native'
import * as Sentry from '@sentry/react-native'
import * as ImagePicker from 'expo-image-picker'
import { useSWRConfig } from 'swr'
import { ArrowUpTrayIcon } from 'react-native-heroicons/outline'

import { useImgurService } from '@/containers/ImgurService'
import { useAlertService } from '@/containers/AlertService'

import { useAlbum } from './context'
import { USER_ROOT_ALBUM } from './constants'

export default function UploadButton(props) {
  const imgur = useImgurService()
  const album = useAlbum()
  const { mutate } = useSWRConfig()
  const alert = useAlertService()
  if (!imgur) {
    return null
  }
  return (
    <Pressable
      className="h-[44px] w-[44px] items-center justify-center rounded-full active:bg-neutral-100"
      onPress={async () => {
        const permissionRes =
          await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (permissionRes === 'none') {
          Alert.alert('无相册访问权限')
          return
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          allowsMultipleSelection: true,
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          base64: true
        })
        if (result.cancelled) {
          return
        }
        try {
          await Promise.all(
            result.selected.map(async (item) => {
              const imgurRes = await imgur.upload({
                image: item.base64,
                type: 'base64',
                name: item.fileName
                // album: album?.deletehash
              })
              console.log(imgurRes)
            })
          )
          // 刷新缓存
          mutate(`/imgur/album/${album?.id || USER_ROOT_ALBUM}/images`)
          // mutate album cache
        } catch (err) {
          alert.alertWithType('error', '错误', err.message)
          Sentry.captureException(err)
        }
      }}>
      <ArrowUpTrayIcon size={22} color={props.tintColor} />
      {/* <Text className="text-neutral-900 font-medium text-base text-tracking-whider">
        上传
      </Text> */}
    </Pressable>
  )
}
