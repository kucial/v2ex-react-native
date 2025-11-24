import { useCallback } from 'react'
import { Platform, Text, View } from 'react-native'
import {
  ClockIcon,
  DocumentPlusIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/outline'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

import { usePadLayout } from '@/containers/AppSettingsService'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'
import { usePressBreadcrumb } from '@/utils/hooks'

import Button from '../Button'

export default function MainScreenHeader(props) {
  const { options } = props
  const { composeAuthedNavigation, meta } = useAuthService()
  const { theme, styles } = useTheme()
  const insets = useSafeAreaInsets()
  const padLayout = usePadLayout()
  const router = useRouter()

  const handleNewTopicPress = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        router.push('/new-topic')
      }, []),
    ),
    {
      message: '[MainScreenHeader] `New-Topic` button pressed',
    },
  )
  const handleNotificationPress = usePressBreadcrumb(
    composeAuthedNavigation(
      useCallback(() => {
        router.push('/me/notification')
      }, []),
    ),
    {
      message: '[MainScreenHeader] `Notification` button pressed',
    },
  )
  const handleSearchButtonPress = usePressBreadcrumb(
    useCallback(() => {
      router.push('/search')
    }, []),
    {
      message: '[MainScreenHeader] `Search` button pressed',
    },
  )
  const handleViewedTopicButtonPress = usePressBreadcrumb(
    useCallback(() => {
      router.push('/me/viewed-topics')
    }, []),
    {
      message: '[MainScreenHeader] `Viewed-Topic` button pressed',
    },
  )

  const iconColor = theme.colors.text_desc

  const title = options.title
  return (
    <View
      className='w-full flex-row items-center pl-4'
      style={[
        {
          height: padLayout.active
            ? insets.top
            : Platform.OS === 'android'
              ? 48
              : 48 + insets.top,
          paddingTop: Platform.OS === 'android' ? 0 : insets.top,
          backgroundColor: theme.colors.bg_layer1,
        },
        props.hasBorder && styles.border_b_light,
      ]}
    >
      {!padLayout.active && (
        <View className='flex-1'>
          <View className=''>
            <Text
              className='font-bold'
              style={[styles.text_lg, styles.text_title]}
            >
              {title}
            </Text>
          </View>
        </View>
      )}

      {!padLayout.active && (
        <View className='flex flex-row space-x-1 items-center justify-self-end pr-1'>
          <Button
            className='w-[44px] h-[44px] rounded-full'
            variant='icon'
            radius={22}
            // onPress={handleNewTopicPress}
            onPress={() => {
              router.push('/new-topic')
            }}
          >
            <DocumentPlusIcon size={24} color={iconColor} />
          </Button>
          <Button
            className='w-[44px] h-[44px] rounded-full'
            variant='icon'
            radius={22}
            onPress={handleNotificationPress}
          >
            <View className='relative w-[24px] h-[24px]'>
              <EnvelopeIcon size={24} color={iconColor} />
              {!!meta?.unread_count && (
                <View className='absolute bg-neutral-700 top-[-6px] right-[-8px] rounded-md min-w-[12px] px-[3px] text-center border-2 border-white border-solid'>
                  <Text className='text-white text-[10px]'>
                    {meta.unread_count}
                  </Text>
                </View>
              )}
            </View>
          </Button>

          <Button
            className='w-[44px] h-[44px] rounded-full'
            variant='icon'
            radius={22}
            onPress={handleSearchButtonPress}
          >
            <MagnifyingGlassIcon size={24} color={iconColor} />
          </Button>

          <Button
            className='w-[44px] h-[44px] rounded-full'
            variant='icon'
            radius={22}
            onPress={handleViewedTopicButtonPress}
          >
            <ClockIcon size={24} color={iconColor} />
          </Button>
        </View>
      )}
    </View>
  )
}
