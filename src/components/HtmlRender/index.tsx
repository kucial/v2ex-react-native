import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import ContextMenu from 'react-native-context-menu-view'
import BaseRender, {
  HTMLSourceInline,
  RenderHTMLProps,
} from 'react-native-render-html'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import WebView from 'react-native-webview'
import { TrueSheet } from '@lodev09/react-native-true-sheet'
import { iframeModel } from '@native-html/iframe-plugin'
import * as Sentry from '@sentry/react-native'
import Color from 'color'
import { BarcodeScanningResult } from 'expo-camera'
import * as Clipboard from 'expo-clipboard'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import htmlToMarkdown from 'html-to-md'

import { USER_AGENT } from '@/constants'
import { useAlertService } from '@/containers/AlertService'
import { openImageViewer } from '@/containers/ImageViewingService'
import { useTheme } from '@/containers/ThemeService'
import { extractBase64Decoded, getMaxLength } from '@/utils/content'
import {
  getImgurResourceImageLink,
  getScreenInfo,
  isAppLink,
  isDeepLink,
  isImgurResourceLink,
  isURL,
} from '@/utils/url'

import AnchorRenderer from './AnchorRenderer'
import { RenderContext } from './context'
import htmlMinifier from './htmlMinifier'
import IframeRenderer from './IframeRenderer'
import ImageRenderer from './ImageRenderer'
import PreRenderer from './PreRenderer'
import { atomOne } from './styles'

const renderers = {
  img: ImageRenderer,
  iframe: IframeRenderer,
  a: AnchorRenderer,
  pre: PreRenderer,
}

const customHTMLElementModels = {
  iframe: iframeModel,
}

const defaultTextProps = { selectable: false }

function HtmlRender({
  tagsStyles,
  baseStyle,
  onOpenMemberInfo,
  isModalView,
  ...props
}: RenderHTMLProps & {
  source: HTMLSourceInline
  onOpenMemberInfo?: (data: { type: 'member'; data: string }) => void
  isModalView?: boolean
}) {
  const { theme, colorScheme, styles: themeStyles } = useTheme()
  const alert = useAlertService()
  const selectModalRef = useRef<TrueSheet>(null)
  const base64ModalRef = useRef<TrueSheet>(null)
  const router = useRouter()
  const insets = useSafeAreaInsets()

  // Tracks the insertion-ordered list of image origin URLs registered by
  // ImageRenderer / AnchorRenderer instances within this HtmlRender tree.
  // Shared via RenderContext so renderers can build the carousel in order.
  const imageOrigins = useRef<string[]>([])

  const renderersProps = useMemo(
    () => ({
      iframe: {
        scalesPageToFit: true,
        webViewProps: {
          style: themeStyles.layer1,
          userAgent: USER_AGENT,
        },
      },
      table: { tableRenderers: true },
      ul: { markerBoxStyle: { paddingRight: 4 } },
      ol: { markerBoxStyle: { paddingRight: 2 } },
    }),
    [themeStyles],
  )

  const [textToSelect, setTextToSelect] = useState('')
  const [base64Options, setBase64Options] = useState<[string, string][]>([])

  const pushAppScreen = useCallback(
    (screen: NonNullable<ReturnType<typeof getScreenInfo>>) => {
      switch (screen.name) {
        case 'topic':
          router.push({ pathname: screen.pathname, params: screen.params })
          return
        case 'member':
          router.push({ pathname: screen.pathname, params: screen.params })
          return
        case 'node':
          router.push({ pathname: screen.pathname, params: screen.params })
          return
      }
    },
    [router],
  )
  const [activeModal, setActiveModal] = useState<'select' | 'base64' | null>(
    null,
  )

  const styles = useMemo(() => {
    const baseFontSize = (baseStyle?.fontSize ||
      themeStyles.text_base.fontSize) as number
    return {
      body: {
        color:
          typeof theme.colors.text === 'string' ? theme.colors.text : undefined,
        fontSize: baseFontSize,
        lineHeight: baseFontSize * 1.5,
      },
      h1: {
        fontSize: (28 / 16) * baseFontSize,
        lineHeight: (28 / 16) * baseFontSize * 1.1,
        marginTop: 1.25 * baseFontSize,
        marginBottom: baseFontSize,
      },
      h2: {
        fontSize: (24 / 16) * baseFontSize,
        lineHeight: (24 / 16) * baseFontSize * 1.1,
        marginTop: 1.25 * baseFontSize,
        marginBottom: baseFontSize,
      },
      h3: {
        fontSize: (20 / 16) * baseFontSize,
        lineHeight: (20 / 16) * baseFontSize * 1.1,
        marginTop: 1.25 * baseFontSize,
        marginBottom: baseFontSize,
      },
      h4: {
        fontSize: (18 / 16) * baseFontSize,
        lineHeight: (18 / 16) * baseFontSize * 1.1,
        marginTop: baseFontSize / 1.5,
        marginBottom: baseFontSize / 2,
      },
      h5: {
        fontSize: (16 / 16) * baseFontSize,
        lineHeight: (16 / 16) * baseFontSize * 1.1,
        marginVertical: baseFontSize / 2,
      },
      h6: {
        fontSize: (14 / 16) * baseFontSize,
        lineHeight: (14 / 16) * baseFontSize * 1.1,
        marginVertical: baseFontSize / 2,
      },
      hr: { marginVertical: baseFontSize },
      pre: {
        backgroundColor: theme.colors.html_pre_bg,
        paddingVertical: baseFontSize * 0.8,
        lineHeight: 1.25 * baseFontSize,
        borderRadius: 4,
      },
      br: { backgroundColor: 'orange' },
      code: { fontSize: 14 },
      ul: { marginTop: 0, marginBottom: baseFontSize },
      p: { marginTop: 0, marginBottom: baseFontSize },
      a: {
        textDecorationLine: 'none' as const,
        color:
          typeof theme.colors.text_link === 'string'
            ? theme.colors.text_link
            : undefined,
      },
      blockquote: {
        marginLeft: 0,
        paddingLeft: baseFontSize * 1.5,
        paddingVertical: baseFontSize * 0.25,
        borderLeftWidth: 3,
        borderLeftColor:
          typeof theme.colors.text === 'string' ? theme.colors.text : undefined,
      },
      tr: { flexDirection: 'row' as const, width: '100%' },
      td: { flex: 1 },
      th: {
        borderBottomWidth: 1,
        borderBottomColor:
          typeof theme.colors.text_meta === 'string'
            ? theme.colors.text_meta
            : undefined,
        flex: 1,
      },
      ...(tagsStyles || {}),
    }
  }, [tagsStyles, baseStyle, themeStyles, theme])

  // Per-instance QR handler — passed through RenderContext so ImageRenderer
  // can hand it to the global viewer when opening, without needing a Provider.
  const handleQrCode = useCallback(
    (result: BarcodeScanningResult) => {
      const { data } = result
      if (isAppLink(data)) {
        const screen = getScreenInfo(data)
        if (screen) {
          pushAppScreen(screen)
          return
        }
      } else if (isURL(data) || isDeepLink(data)) {
        Linking.openURL(data)
      } else {
        Alert.alert('信息', getMaxLength(data, 120), [
          { text: '取消', style: 'cancel' },
          {
            text: '复制',
            onPress: async () => {
              await Clipboard.setStringAsync(data)
              alert.show({ type: 'success', message: '已复制到粘贴板' })
            },
          },
        ])
      }
    },
    [alert, pushAppScreen],
  )

  const renderContext = useMemo(
    () => ({
      handleUrlPress: (payload: {
        interaction: 'default' | 'preview' | 'default'
        url: string
      }) => {
        if (payload.interaction !== 'default') return
        const { url } = payload
        if (isAppLink(url)) {
          const screen = getScreenInfo(url)
          if (screen) {
            if (screen.name === 'member' && onOpenMemberInfo) {
              onOpenMemberInfo({ type: 'member', data: screen.params.username })
              return
            }
            if (isModalView) return
            pushAppScreen(screen)
            return
          }
        }
        if (isImgurResourceLink(url)) {
          // Imgur resource anchor taps are handled by AnchorRenderer directly
          // via openImageViewer(). If reached here it means no registered image.
          openImageViewer(
            getImgurResourceImageLink(url),
            imageOrigins.current,
            handleQrCode,
          )
          return
        }
        if (url.startsWith('mailto:')) {
          Linking.openURL(url)
          return
        }
        if (Platform.OS === 'ios') {
          WebBrowser.openBrowserAsync(url, {
            controlsColor:
              typeof theme.colors.primary === 'string'
                ? theme.colors.primary
                : undefined,
            dismissButtonStyle: 'close',
            presentationStyle:
              WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          }).catch((err) => {
            Sentry.captureException(err)
          })
        } else {
          router.push({ pathname: '/browser', params: { url } })
        }
      },
      handleQrCode,
      imageOrigins,
    }),

    [
      onOpenMemberInfo,
      router,
      theme.colors.primary,
      isModalView,
      handleQrCode,
      pushAppScreen,
    ],
  )

  const handleCopy = useCallback(async () => {
    try {
      const content = htmlToMarkdown(props.source.html)
      await Clipboard.setStringAsync(content)
      alert.show({ type: 'success', message: '已复制到粘贴板', duration: 500 })
    } catch (err) {
      Sentry.captureException(err)
    }
  }, [props.source.html, alert])

  const copyAndNotice = useCallback(
    async (text: string) => {
      await Clipboard.setStringAsync(text)
      alert.show({ type: 'success', message: '已复制到粘贴板: ' + text })
    },
    [alert],
  )

  const handleBase64Decode = useCallback(() => {
    try {
      const content = htmlToMarkdown(props.source.html)
      const result = extractBase64Decoded(content)
      if (result && result.length) {
        if (result.length === 1) {
          copyAndNotice(result[0][1])
        } else {
          setBase64Options(result)
          setActiveModal('base64')
        }
      } else {
        alert.show({ type: 'info', message: '未找到 base64 字符串' })
      }
    } catch (err) {
      alert.show({ type: 'error', message: '未识别到有效内容' })
      Sentry.addBreadcrumb({ data: { text: props.source.html } })
      Sentry.captureException(err)
    }
  }, [props.source.html, copyAndNotice, alert])

  const handleSelect = useCallback(() => {
    const content = htmlToMarkdown(props.source.html)
    setTextToSelect(content)
    setActiveModal('select')
  }, [props.source.html])

  useEffect(() => {
    if (activeModal === 'select') {
      selectModalRef.current?.present()
    } else if (activeModal === 'base64') {
      base64ModalRef.current?.present()
    }
  }, [activeModal])

  const source = useMemo(
    () => ({ ...props.source, html: htmlMinifier(props.source.html) }),
    [props.source],
  )

  return (
    // No ImageViewingServiceProvider wrapper — image registry lives in the
    // global Zustand store. Each HtmlRender instance only provides its
    // per-instance handleQrCode and the imageOrigins ref via RenderContext.
    <RenderContext.Provider value={renderContext}>
      <View style={{ margin: -6 }}>
        <ContextMenu
          actions={[
            { title: '复制', systemIcon: 'doc.on.doc' },
            { title: '选择文本', systemIcon: 'hand.point.up.left.and.text' },
            { title: 'base64 提取', systemIcon: 'text.viewfinder' },
          ]}
          onPress={({ nativeEvent }) => {
            switch (nativeEvent.index) {
              case 0:
                return handleCopy()
              case 1:
                return handleSelect()
              case 2:
                return handleBase64Decode()
            }
          }}
          previewBackgroundColor={
            typeof themeStyles.layer1.backgroundColor === 'string'
              ? themeStyles.layer1.backgroundColor
              : undefined
          }
          preview={<View></View>}
        >
          <View
            nativeID='CONTEXT_WORK_ARROUND'
            style={[{ padding: 6, borderRadius: 8 }]}
          >
            <BaseRender
              WebView={WebView}
              tagsStyles={styles}
              renderers={renderers}
              renderersProps={renderersProps}
              defaultTextProps={defaultTextProps}
              customHTMLElementModels={customHTMLElementModels}
              classesStyles={atomOne[colorScheme]}
              {...props}
              source={source}
              dangerouslyDisableWhitespaceCollapsing
            />
          </View>
        </ContextMenu>
      </View>
      {activeModal === 'select' && (
        <TrueSheet
          ref={selectModalRef}
          scrollable
          grabber={false}
          backgroundColor={
            typeof themeStyles.overlay.backgroundColor === 'string'
              ? themeStyles.overlay.backgroundColor
              : '#000000'
          }
          onDidDismiss={() => setActiveModal(null)}
        >
          <ScrollView
            nestedScrollEnabled
            contentContainerStyle={[
              htmlStyles.selectModalContent,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            {Platform.OS === 'ios' ? (
              <TextInput
                style={styles.body}
                value={textToSelect}
                readOnly
                multiline
                selectionColor={theme.colors.primary}
              />
            ) : (
              <Text
                style={[styles.body, { backgroundColor: 'transparent' }]}
                selectable
                selectionColor={Color(theme.colors.primary)
                  .alpha(0.15)
                  .toString()}
              >
                {textToSelect}
              </Text>
            )}
          </ScrollView>
        </TrueSheet>
      )}
      {activeModal === 'base64' && (
        <TrueSheet
          ref={base64ModalRef}
          detents={['auto']}
          onDidDismiss={() => setActiveModal(null)}
        >
          <ScrollView
            style={themeStyles.overlay}
            contentContainerStyle={[
              htmlStyles.base64ModalContent,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <View style={htmlStyles.rowFull}>
              <View style={[htmlStyles.flex1Py2, themeStyles.border_b]}>
                <Text
                  style={[
                    themeStyles.text,
                    themeStyles.text_base,
                    { fontWeight: 'bold' },
                  ]}
                >
                  字符串
                </Text>
              </View>
              <View style={[htmlStyles.flex1Py2, themeStyles.border_b]}>
                <Text
                  style={[
                    themeStyles.text,
                    themeStyles.text_base,
                    { fontWeight: 'bold' },
                  ]}
                >
                  解码内容
                </Text>
              </View>
            </View>
            {base64Options.map((item) => (
              <Pressable
                key={item[0]}
                style={htmlStyles.rowFull}
                onPress={() => {
                  base64ModalRef.current?.dismiss()
                  copyAndNotice(item[1])
                }}
              >
                <View style={[htmlStyles.flex1Py2, themeStyles.border_b]}>
                  <Text style={[themeStyles.text, themeStyles.text_base]}>
                    {item[0]}
                  </Text>
                </View>
                <View style={[htmlStyles.flex1Py2, themeStyles.border_b]}>
                  <Text style={[themeStyles.text, themeStyles.text_base]}>
                    {item[1]}
                  </Text>
                </View>
              </Pressable>
            ))}
            <View style={htmlStyles.mt3}>
              <Text style={[themeStyles.text, themeStyles.text_sm]}>
                点击选择复制
              </Text>
            </View>
          </ScrollView>
        </TrueSheet>
      )}
    </RenderContext.Provider>
  )
}

const htmlStyles = StyleSheet.create({
  selectModalContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderRadius: 4,
  },
  base64ModalContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  rowFull: {
    flexDirection: 'row',
    width: '100%',
  },
  flex1Py2: {
    flex: 1,
    paddingVertical: 8,
  },
  mt3: {
    marginTop: 12,
  },
})

export default memo(HtmlRender)
