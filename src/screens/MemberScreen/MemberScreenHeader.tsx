import { useCallback, useEffect, useState } from 'react'
import { Platform, Text, View } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import Constants from 'expo-constants'
import { Image } from 'expo-image'
import * as Sentry from 'sentry-expo'
import useSWR from 'swr'

import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import { useAlertService } from '@/containers/AlertService'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'
import { getImageLuminosity } from '@/utils/image'
import { localTime } from '@/utils/time'
import {
  blockMember,
  unblockMember,
  unwatchMember,
  watchMember,
} from '@/utils/v2ex-client'
import { getMemberDetail } from '@/utils/v2ex-client'
import { MemberBasic, MemberDetail } from '@/utils/v2ex-client/types'
import { StatusResponse } from '@/utils/v2ex-client/types'

import MemberInfoLinks from './MemberInfoLinks'

const AnimatedImage = Animated.createAnimatedComponent(Image)

const AVATAR_SIZE = 72
const HEADER_CANVAS_HEIGHT = 64

export default function MemberScreenHeader(props: {
  username: string
  brief?: MemberBasic
  setHeaderHeight: (val: number) => void
  headerHeight: number
  headerCollapsedHeight: number
  scrollY: SharedValue<number>
}) {
  const navigation = useNavigation<
    NativeStackNavigationProp<AppStackParamList> &
      BottomTabNavigationProp<MainTabParamList>
  >()
  const {
    username,
    brief,
    headerHeight,
    setHeaderHeight,
    headerCollapsedHeight,
    scrollY,
  } = props

  const { user: currentUser } = useAuthService()

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

  const data = memberSwr.data
  const avatar = data?.avatar_large || brief?.avatar_large
  const { theme, styles } = useTheme()
  const alert = useAlertService()
  const [avatarLuminosity, setAvatarLuminosity] = useState(0)

  useEffect(() => {
    if (avatar) {
      getImageLuminosity(avatar, {
        start: [0, 25],
        end: [50, 75],
      })
        .then(setAvatarLuminosity)
        .catch((err) => {
          Sentry.Native.captureException(err)
        })
    }
  }, [avatar])

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

  const handleWatchToggle = useCallback(() => {
    const { data } = memberSwr
    if (!data) {
      return
    }
    let promise: Promise<StatusResponse<Pick<MemberDetail, 'meta'>>>
    let successMsg: string
    if (data.meta?.blocked) {
      promise = unwatchMember({ id: data.id })
      successMsg = '成功取消用户关注'
    } else {
      promise = watchMember({ id: data.id })
      successMsg = '成功关注'
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

  const topBannerHeight =
    Platform.OS === 'android'
      ? HEADER_CANVAS_HEIGHT + 6
      : HEADER_CANVAS_HEIGHT + Constants.statusBarHeight

  const topDelta = topBannerHeight - headerCollapsedHeight

  const handleLayout = useCallback((e) => {
    setHeaderHeight(e.nativeEvent.layout.height)
  }, [])

  const layer2OffsetStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, headerHeight],
      [0, -1 * headerHeight],
      {
        extrapolateRight: Extrapolation.CLAMP,
        extrapolateLeft: Extrapolation.CLAMP,
      },
    )
    return {
      transform: [{ translateY }],
      zIndex: scrollY.value >= topDelta ? 1 : 3,
    }
  }, [headerHeight])

  const layer1OffsetStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, topDelta],
      [0, -topDelta],
      {
        extrapolateRight: Extrapolation.CLAMP,
        extrapolateLeft: Extrapolation.CLAMP,
      },
    )
    return {
      transform: [{ translateY }],
    }
  })

  const avatarSizeStyle = useAnimatedStyle(() => {
    const size = interpolate(
      scrollY.value,
      [0, topDelta],
      [AVATAR_SIZE, AVATAR_SIZE - topDelta],
      {
        extrapolateRight: Extrapolation.CLAMP,
        extrapolateLeft: Extrapolation.CLAMP,
      },
    )
    return {
      width: size,
      height: size,
    }
  })

  const headerTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [90, headerHeight - 48],
      [0, 1],
      {
        extrapolateRight: Extrapolation.CLAMP,
      },
    )
    return { opacity }
  }, [headerHeight])

  const headerContractColor = avatarLuminosity > 130 ? '#1C1C1E' : '#d4d4d4'

  return (
    <>
      <View
        style={{
          position: 'absolute',
          left: 12,
          top: Platform.OS === 'android' ? 4 : Constants.statusBarHeight,
          zIndex: 10,
        }}>
        <BackButton
          tintColor={headerContractColor}
          style={{
            width: 36,
            height: 36,
          }}
          onPress={() => {
            navigation.goBack()
          }}
        />
      </View>
      <Animated.View
        style={[
          {
            position: 'absolute',
            zIndex: 2,
            top: 0,
            width: '100%',
            height: topBannerHeight,
          },
          styles.layer1,
          layer1OffsetStyle,
        ]}>
        <Image
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          source={{ uri: avatar }}
          contentFit="cover"
          blurRadius={10}
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            width: '100%',
          },
          layer2OffsetStyle,
        ]}>
        <View style={[{ width: '100%' }]} onLayout={handleLayout}>
          <View
            style={{
              height: topBannerHeight,
              zIndex: 2,
            }}>
            <View
              style={{
                position: 'absolute',
                zIndex: 2,
                left: 16,
                bottom: -AVATAR_SIZE * 0.7,
                width: AVATAR_SIZE,
                alignItems: 'center',
              }}>
              <AnimatedImage
                className="w-full h-full rounded-full"
                style={[
                  {
                    borderWidth: 3,
                    borderColor: theme.colors.bg_layer1,
                    backgroundColor: theme.colors.text_placeholder,
                  },
                  avatarSizeStyle,
                ]}
                source={{ uri: avatar }}
              />
            </View>
          </View>
          <View style={styles.layer1}>
            <View
              className="flex flex-row"
              style={{
                marginLeft: AVATAR_SIZE + 16 + 12,
                minHeight: AVATAR_SIZE * 0.7,
              }}>
              <View className="flex flex-row pr-3 pt-2 ml-auto">
                {data && currentUser && username !== currentUser.username && (
                  <Button
                    size="md"
                    variant="default"
                    onPress={handleBlockToggle}
                    label={data.meta?.blocked ? '取消屏蔽' : '屏蔽'}></Button>
                )}
                {data && currentUser && username !== currentUser.username && (
                  <Button
                    size="md"
                    variant="default"
                    className="ml-3"
                    onPress={handleWatchToggle}
                    label={data.meta?.watched ? '取消关注' : '关注'}></Button>
                )}
              </View>
            </View>
            <View className="px-3 pb-2">
              <View className="flex-1 pb-2">
                <Text className="text-lg font-bold" style={styles.text_primary}>
                  {username}
                </Text>
                {data?.tagline && (
                  <View>
                    <Text className="text-sm" style={styles.text}>
                      {data.tagline}
                    </Text>
                  </View>
                )}
                <Text className="text-sm" style={styles.text_meta}>
                  {data?.created
                    ? `${localTime(data.created * 1000)} 加入`
                    : ''}
                </Text>
              </View>
              <MemberInfoLinks data={memberSwr.data} />
            </View>
          </View>
        </View>
      </Animated.View>
      {/* Collapsed */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: Constants.statusBarHeight,
            left: 64,
            zIndex: 6,
            height: 36,
            justifyContent: 'center',
          },
          headerTitleStyle,
        ]}>
        <Text
          style={[
            {
              fontSize: 17,
              fontWeight: '500',
              color: headerContractColor,
            },
          ]}>
          {username}
        </Text>
      </Animated.View>
    </>
  )
}
