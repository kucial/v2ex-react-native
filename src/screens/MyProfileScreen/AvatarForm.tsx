import { useCallback, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as ImageManipulator from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'

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
  const queryClient = useQueryClient()

  const fetchForm = useCallback(async () => {
    const res = await fetchAvatarForm()
    return res.data
  }, [props.username])

  const avatarFormQuery = useQuery({
    queryKey: ['/menber/:username/avatar.json', props.username],
    queryFn: fetchForm,
    refetchOnMount: true,
    enabled: props.isActive,
    staleTime: 0,
  })

  const [uploading, setUploading] = useState(false)
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
    setUploading(true)
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
        once: avatarFormQuery.data.once,
      })
      queryClient.setQueryData(
        ['/menber/:username/avatar.json', props.username],
        updateRes.data,
      )
      setAvatar(null)
      alert.show({ type: 'success', message: '头像已更新' })
      props.onUpdated?.()
    } catch (err) {
      alert.show({ type: 'error', message: err.message })
    } finally {
      setUploading(false)
    }
  }

  const handleFormRefetch = useCallback(() => {
    if (uploading) {
      return
    }
    avatarFormQuery.refetch()
  }, [uploading, avatarFormQuery])

  return (
    <ScrollView
      refreshControl={
        <MyRefreshControl
          refreshing={avatarFormQuery.isRefetching}
          onRefresh={handleFormRefetch}
        />
      }
    >
      <MaxWidthWrapper style={avatarStyles.wrapper}>
        <GroupWapper
          innerStyle={styles.layer1}
          style={avatarFormQuery.isRefetching && { opacity: 0.4 }}
          pointerEvents={avatarFormQuery.isRefetching ? 'none' : 'auto'}
        >
          <SectionHeader title='当前头像' />
          <View style={avatarStyles.avatarRow}>
            <Image
              source={{ uri: avatarFormQuery.data?.avatars[0] }}
              style={[
                avatarStyles.avatarLarge,
                { backgroundColor: theme.colors.skeleton },
              ]}
            />
            <Image
              source={{ uri: avatarFormQuery.data?.avatars[1] }}
              style={[
                avatarStyles.avatarMedium,
                { backgroundColor: theme.colors.skeleton },
              ]}
            />
            <Image
              source={{ uri: avatarFormQuery.data?.avatars[2] }}
              style={[
                avatarStyles.avatarSmall,
                { backgroundColor: theme.colors.skeleton },
              ]}
            />
          </View>
          <SectionHeader title='新头像' />

          <View style={avatarStyles.pickerRow}>
            <Pressable
              style={({ pressed }) => [
                avatarStyles.pressableRow,
                pressed && avatarStyles.pressed,
              ]}
              onPress={pickImage}
            >
              <Image
                key={avatar?.uri + 'large'}
                source={avatar}
                style={[
                  avatarStyles.avatarLarge,
                  { backgroundColor: theme.colors.skeleton },
                ]}
              />
              <Image
                key={avatar?.uri + 'normal'}
                source={avatar}
                style={[
                  avatarStyles.avatarMedium,
                  { backgroundColor: theme.colors.skeleton },
                ]}
              />
              <Image
                key={avatar?.uri + 'mini'}
                source={avatar}
                style={[
                  avatarStyles.avatarSmall,
                  { backgroundColor: theme.colors.skeleton },
                ]}
              />
            </Pressable>
          </View>
          <View style={avatarStyles.btnRow}>
            {avatar ? (
              <Button
                loading={uploading}
                disabled={uploading}
                variant='primary'
                size='md'
                label='上传头像'
                onPress={handleUpload}
              />
            ) : (
              <Button
                variant='primary'
                size='md'
                label='选择图片'
                onPress={pickImage}
              />
            )}
          </View>
        </GroupWapper>
      </MaxWidthWrapper>
    </ScrollView>
  )
}

const avatarStyles = StyleSheet.create({
  wrapper: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  pickerRow: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  pressableRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  pressed: {
    opacity: 0.5,
  },
  avatarLarge: {
    width: 73,
    height: 73,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  avatarMedium: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  avatarSmall: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  btnRow: {
    padding: 12,
    flexDirection: 'row',
    marginBottom: 8,
  },
})

export default AvatarPicker
