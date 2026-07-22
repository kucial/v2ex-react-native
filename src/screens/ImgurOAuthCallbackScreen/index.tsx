import { useCallback, useEffect, useMemo, useRef } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import * as Linking from 'expo-linking'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { useAlertService } from '@/containers/AlertService'
import { useImgurService } from '@/containers/ImgurService'
import { useTheme } from '@/containers/ThemeService'
import { parseImgurOAuthCallback } from '@/utils/imgur-oauth'
import {
  clearPendingImgurOAuth,
  loadPendingImgurOAuth,
} from '@/utils/imgur-oauth-pending'

export default function ImgurOAuthCallbackScreen() {
  const params = useLocalSearchParams<{ callbackUrl?: string | string[] }>()
  const linkingUrl = Linking.useURL()
  const callbackUrl = useMemo(() => {
    const routeCallbackUrl = Array.isArray(params.callbackUrl)
      ? params.callbackUrl[0]
      : params.callbackUrl

    for (const candidate of [routeCallbackUrl, linkingUrl]) {
      if (!candidate) continue
      if (parseImgurOAuthCallback(candidate)) return candidate

      try {
        const decodedCandidate = decodeURIComponent(candidate)
        if (parseImgurOAuthCallback(decodedCandidate)) return decodedCandidate
      } catch {}
    }

    return null
  }, [linkingUrl, params.callbackUrl])
  const handledUrlRef = useRef<string | null>(null)
  const router = useRouter()
  const alert = useAlertService()
  const imgurService = useImgurService()
  const { theme, styles } = useTheme()

  const returnToApp = useCallback(
    (autoBack = false) => {
      requestAnimationFrame(() => {
        if (autoBack && router.canDismiss()) {
          router.dismiss(2)
        } else {
          router.dismissTo('/imgur-settings')
        }
      })
    },
    [router],
  )

  useEffect(() => {
    if (!callbackUrl || handledUrlRef.current === callbackUrl) return

    const result = parseImgurOAuthCallback(callbackUrl)
    if (!result) return

    handledUrlRef.current = callbackUrl
    const pendingRequest = loadPendingImgurOAuth()

    if (!result.ok) {
      clearPendingImgurOAuth()
      alert.show({ type: 'error', message: result.error })
      returnToApp()
      return
    }

    if (!pendingRequest || result.state !== pendingRequest.state) {
      clearPendingImgurOAuth()
      alert.show({
        type: 'error',
        message: 'Imgur 授权会话已过期，请重新授权。',
      })
      returnToApp()
      return
    }

    clearPendingImgurOAuth()
    imgurService.updateCredentials({
      client_id: pendingRequest.clientId,
      ...result.credentials,
    })
    alert.show({ type: 'success', message: 'Imgur 授权成功' })
    returnToApp(pendingRequest.autoBack)
  }, [alert, callbackUrl, imgurService, returnToApp])

  useEffect(() => {
    if (callbackUrl) return

    const timeout = setTimeout(() => {
      clearPendingImgurOAuth()
      alert.show({
        type: 'error',
        message: '未收到 Imgur 授权结果，请重新授权。',
      })
      returnToApp()
    }, 2500)

    return () => clearTimeout(timeout)
  }, [alert, callbackUrl, returnToApp])

  return (
    <View style={[styles.layer1, callbackStyles.container]}>
      <ActivityIndicator color={theme.colors.primary} />
      <Text style={[styles.text_meta, callbackStyles.message]}>
        正在完成 Imgur 授权…
      </Text>
    </View>
  )
}

const callbackStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 12,
  },
})
