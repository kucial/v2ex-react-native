import { useCallback } from 'react'
import { Platform, Pressable, Text, View } from 'react-native'
import {
  ClockIcon,
  DocumentPlusIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/outline'
import type { BottomTabHeaderProps } from '@react-navigation/bottom-tabs'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import Constants from 'expo-constants'

import { usePadLayout } from '@/containers/AppSettingsService'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'
import { usePressBreadcrumb } from '@/utils/hooks'

export default function MainScreenHeader(
  props: BottomTabHeaderProps &
    NativeStackScreenProps<AppStackParamList> & {
      hasBorder?: boolean
    },
) {
  const { navigation, options } = props
  const { composeAuthedNavigation, meta } = useAuthService()
  const { theme, styles } = useTheme()
  const padLayout = usePadLayout()
  const handleNewTopicPress = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        navigation.push('new-topic')
      }, []),
    ),
    {
      message: '[MainScreenHeader] `New-Topic` button pressed',
    },
  )
  const handleNotificationPress = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        navigation.push('notification')
      }, []),
    ),
    {
      message: '[MainScreenHeader] `Notification` button pressed',
    },
  )
  const handleSearchButtonPress = usePressBreadcrumb(
    useCallback(() => {
      navigation.push('search')
    }, []),
    {
      message: '[MainScreenHeader] `Search` button pressed',
    },
  )
  const handleViewedTopicButtonPress = usePressBreadcrumb(
    useCallback(() => {
      navigation.push('viewed-topics')
    }, []),
    {
      message: '[MainScreenHeader] `Viewed-Topic` button pressed',
    },
  )

  const iconColor = theme.colors.text_desc

  const title = options.title
  return (
    <View
      className="w-full flex-row items-center pl-4"
      style={[
        {
          height:
            Platform.OS === 'android' ? 48 : 48 + Constants.statusBarHeight,
          paddingTop: Platform.OS === 'android' ? 0 : Constants.statusBarHeight,
          backgroundColor: theme.colors.bg_layer1,
        },
        props.hasBorder && styles.border_b_light,
      ]}>
      <View className="flex-1">
        <View className="">
          <Text
            className="font-bold text-[19px]"
            style={{
              color: theme.colors.text_title,
            }}>
            {title}
          </Text>
        </View>
      </View>

      {!padLayout.active && (
        <View className="flex flex-row space-x-1 items-center justify-self-end pr-1">
          <Pressable
            className="w-[44px] h-[44px] flex items-center justify-center rounded-full active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
            onPress={handleNewTopicPress}>
            <DocumentPlusIcon size={24} color={iconColor} />
          </Pressable>
          <Pressable
            className="w-[44px] h-[44px] flex items-center justify-center rounded-full active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
            onPress={handleNotificationPress}>
            <View className="relative w-[24px] h-[24px]">
              <EnvelopeIcon size={24} color={iconColor} />
              {!!meta?.unread_count && (
                <View className="absolute bg-neutral-700 top-[-6px] right-[-8px] rounded-md min-w-[12px] px-[3px] text-center border-2 border-white border-solid">
                  <Text className="text-white text-[10px]">
                    {meta.unread_count}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>

          <Pressable
            className="w-[44px] h-[44px] flex items-center justify-center rounded-full active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
            onPress={handleSearchButtonPress}>
            <MagnifyingGlassIcon size={24} color={iconColor} />
          </Pressable>

          <Pressable
            className="w-[44px] h-[44px] flex items-center justify-center rounded-full active:bg-neutral-100 active:opacity-60 dark:active:bg-neutral-600"
            onPress={handleViewedTopicButtonPress}>
            <ClockIcon size={24} color={iconColor} />
          </Pressable>
        </View>
      )}
    </View>
  )
}
