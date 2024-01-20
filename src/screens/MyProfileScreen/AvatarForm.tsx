import React, { useState } from 'react'
import { Image, Pressable, ScrollView, View } from 'react-native'
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'
import useSWR from 'swr'

import Button from '@/components/Button'
import GroupWapper from '@/components/GroupWrapper'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import MyRefreshControl from '@/components/MyRefreshControl'
import SectionHeader from '@/components/SectionHeader'
import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { fetchAvatarForm, uploadAvatar } from '@/utils/v2ex-client'

const AvatarPicker = (props: {
  username: string
  isActive?: boolean
  onUpdated?(): void
}) => {
  const { styles, theme } = useTheme()
  const alert = useAlertService()

  const avatarSwr = useSWR(
    props.isActive ? `/member/${props.username}/avatar.json` : null,
    async () => {
      const res = await fetchAvatarForm()
      return res.data
    },
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    },
  )

  const [loading, setLoading] = useState(false)
  // selected
  const [avatar, setAvatar] = useState(null)

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })

    if (!result.canceled) {
      setAvatar(result.assets[0])
    }
  }

  const handleUpload = async () => {
    setLoading(true)
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        avatar.uri,
        [{ resize: { width: 512, height: 512 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG },
      )
      const updateRes = await uploadAvatar({
        avatar: {
          uri: manipResult.uri,
          name: avatar.fileName || 'avatar.png',
          type: avatar.type,
        },
        once: avatarSwr.data.once,
      })
      avatarSwr.mutate(updateRes.data, { revalidate: false })
      setAvatar(null)
      alert.show({ type: 'success', message: '头像已更新' })
      props.onUpdated?.()
    } catch (err) {
      alert.show({ type: 'error', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView
      refreshControl={
        <MyRefreshControl
          refreshing={avatarSwr.isValidating}
          onRefresh={() => {
            if (!avatarSwr.isValidating && !loading) {
              avatarSwr.mutate()
            }
          }}
        />
      }>
      <MaxWidthWrapper className="py-4 px-2">
        <GroupWapper
          innerStyle={styles.layer1}
          style={avatarSwr.isValidating && { opacity: 0.4 }}
          pointerEvents={avatarSwr.isValidating ? 'none' : 'auto'}>
          <SectionHeader title="当前头像" />
          <View className="flex flex-row items-end px-1 py-2">
            <Image
              source={{ uri: avatarSwr.data?.avatars[0] }}
              style={{ backgroundColor: theme.colors.skeleton }}
              className="w-[73] h-[73] rounded mx-2"
            />
            <Image
              source={{ uri: avatarSwr.data?.avatars[1] }}
              style={{ backgroundColor: theme.colors.skeleton }}
              className="w-[48] h-[48] rounded mx-2"
            />
            <Image
              source={{ uri: avatarSwr.data?.avatars[2] }}
              style={{ backgroundColor: theme.colors.skeleton }}
              className="w-[24] h-[24] rounded mx-2"
            />
          </View>
          <SectionHeader title="新头像" />

          <View className="px-1 py-2">
            <Pressable
              className="flex flex-row items-end active:opacity-50"
              onPress={pickImage}>
              <Image
                key={avatar?.uri + 'large'}
                source={avatar}
                style={{ backgroundColor: theme.colors.skeleton }}
                className="w-[73] h-[73] rounded mx-2"
              />
              <Image
                key={avatar?.uri + 'normal'}
                source={avatar}
                style={{ backgroundColor: theme.colors.skeleton }}
                className="w-[48] h-[48] rounded mx-2"
              />
              <Image
                key={avatar?.uri + 'mini'}
                source={avatar}
                style={{ backgroundColor: theme.colors.skeleton }}
                className="w-[24] h-[24] rounded mx-2"
              />
            </Pressable>
          </View>
          <View className="p-3 flex flex-row mb-2">
            {avatar ? (
              <Button
                loading={loading}
                disabled={loading}
                variant="primary"
                size="md"
                label="上传头像"
                onPress={handleUpload}
              />
            ) : (
              <Button
                variant="primary"
                size="md"
                label="选择图片"
                onPress={pickImage}
              />
            )}
          </View>
        </GroupWapper>
      </MaxWidthWrapper>
    </ScrollView>
  )
}

export default AvatarPicker
