import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Sentry from '@sentry/react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import BackButton from '@/components/BackButton'
import Button from '@/components/Button'

import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { useCurrentUser } from '@/stores/auth'
import { getImageLuminosity } from '@/utils/image'
import { localTime } from '@/utils/time'
import {
  blockMember,
  getMemberDetail,
  unblockMember,
  unwatchMember,
  watchMember,
} from '@/utils/v2ex-client'
import {
  MemberBasic,
  MemberDetail,
  StatusResponse,
} from '@/utils/v2ex-client/types'

import MemberInfoLinks from './MemberInfoLinks'

const AnimatedImage = Animated.createAnimatedComponent(Image)

const AVATAR_SIZE = 72
const HEADER_CANVAS_HEIGHT = 64

export default function MemberScreenHeader(props: {
  username: string
  brief?: MemberBasic
  /** Called when the header measures its own height — pass to ProfileCoordinator as onHeaderLayout. */
  onLayout: (height: number) => void
  headerHeight: number
  headerCollapsedHeight: number
  scrollY: SharedValue<number>
}) {
  const {
    username,
    brief,
    headerHeight,
    onLayout,
    headerCollapsedHeight,
    scrollY,
  } = props

  const insets = useSafeAreaInsets()

  const router = useRouter()

  const currentUser = useCurrentUser()
  const fetchMember = useCallback(async () => {
    const { data } = await getMemberDetail({ username })
    return data
  }, [username])

  const memberQuery = useQuery({
    queryKey: [`/page/member/:username/info.json`, username],
    queryFn: fetchMember,
  })

  const queryClient = useQueryClient()

  const data = memberQuery.data
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
          Sentry.captureException(err)
        })
    }
  }, [avatar])

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
  }, [memberQuery, username, alert, queryClient])

  const handleWatchToggle = useCallback(() => {
    const { data } = memberQuery
    if (!data) {
      return
    }
    let promise: Promise<StatusResponse<Pick<MemberDetail, 'meta'>>>
    let successMsg: string
    if (data.meta?.watched) {
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
  }, [memberQuery, username, alert, queryClient])

  const topBannerHeight = HEADER_CANVAS_HEIGHT + insets.top

  const topDelta = topBannerHeight - headerCollapsedHeight

  const handleLayout = useCallback(
    (e) => {
      onLayout(e.nativeEvent.layout.height)
    },
    [onLayout],
  )

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
  }, [headerHeight, topDelta])

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
  }, [topDelta])

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
  }, [topDelta])

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
          top: insets.top,
          zIndex: 100,
        }}
      >
        <BackButton
          tintColor={headerContractColor}
          style={{
            width: 36,
            height: 36,
          }}
          onPress={() => {
            router.back()
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
        ]}
      >
        <Image
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          source={{ uri: avatar }}
          contentFit='cover'
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
        ]}
      >
        <View style={[{ width: '100%' }]} onLayout={handleLayout}>
          <View
            style={{
              height: topBannerHeight,
              zIndex: 2,
            }}
          >
            <View
              style={{
                position: 'absolute',
                zIndex: 2,
                left: 16,
                bottom: -1 * Math.round(AVATAR_SIZE * 0.7),
                width: AVATAR_SIZE,
                alignItems: 'center',
              }}
            >
              <AnimatedImage
                style={[
                  headerStyles.avatarImg,
                  {
                    borderWidth: 4,
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
              style={[
                headerStyles.actionRow,
                {
                  marginLeft: AVATAR_SIZE + 16 + 12,
                  minHeight: Math.round(AVATAR_SIZE * 0.7),
                },
              ]}
            >
              <View style={headerStyles.actionBtns}>
                {data && currentUser && username !== currentUser.username && (
                  <Button
                    size='md'
                    variant='default'
                    onPress={handleBlockToggle}
                    label={data.meta?.blocked ? '取消屏蔽' : '屏蔽'}
                  ></Button>
                )}
                {data && currentUser && username !== currentUser.username && (
                  <Button
                    size='md'
                    variant='default'
                    style={headerStyles.watchBtn}
                    onPress={handleWatchToggle}
                    label={data.meta?.watched ? '取消关注' : '关注'}
                  ></Button>
                )}
              </View>
            </View>
            <View style={headerStyles.infoWrap}>
              <View style={headerStyles.infoInner}>
                <Text
                  style={[
                    styles.text_primary,
                    styles.text_lg,
                    headerStyles.username,
                  ]}
                >
                  {username}
                </Text>
                {data?.tagline && (
                  <View>
                    <Text style={[styles.text, styles.text_sm]}>
                      {data.tagline}
                    </Text>
                  </View>
                )}
                <Text style={[styles.text_meta, styles.text_sm]}>
                  {data?.created
                    ? `${localTime(data.created * 1000)} 加入`
                    : ''}
                </Text>
              </View>
              <MemberInfoLinks data={memberQuery.data} />
            </View>
          </View>
        </View>
      </Animated.View>
      {/* Collapsed */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: insets.top,
            left: 64,
            zIndex: 6,
            height: 36,
            justifyContent: 'center',
          },
          headerTitleStyle,
        ]}
      >
        <Text
          style={[
            {
              fontSize: 17,
              fontWeight: '500',
              color: headerContractColor,
            },
          ]}
        >
          {username}
        </Text>
      </Animated.View>
    </>
  )
}

const headerStyles = StyleSheet.create({
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
  actionRow: {
    flexDirection: 'row',
  },
  actionBtns: {
    flexDirection: 'row',
    paddingRight: 12,
    paddingTop: 8,
    marginLeft: 'auto',
  },
  watchBtn: {
    marginLeft: 12,
  },
  infoWrap: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  infoInner: {
    flex: 1,
    paddingBottom: 8,
  },
  username: {
    fontWeight: 'bold',
  },
})
