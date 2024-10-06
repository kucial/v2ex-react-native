import { useCallback, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import BaseRender, {
  HTMLSourceInline,
  RenderHTMLProps,
} from 'react-native-render-html'
import WebView from 'react-native-webview'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import IframeRenderer, { iframeModel } from '@native-html/iframe-plugin'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as Sentry from '@sentry/react-native'
import Color from 'color'
import { BarCodeScannerResult } from 'expo-barcode-scanner'
import * as Clipboard from 'expo-clipboard'
import * as WebBrowser from 'expo-web-browser'
// import { convert as htmlToMarkdown } from 'react-native-html-to-markdown'
import htmlToMarkdown from 'html-to-md'
import * as ContextMenu from 'zeego/context-menu'

import { USER_AGENT } from '@/constants'
import { useAlertService } from '@/containers/AlertService'
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

import MyBottomSheetModal from '../MyBottomSheetModal'
import AnchorRenderer from './AnchorRenderer'
import { RenderContext } from './context'
import HorizontalScrollRenderer from './HorizontalScrollRenderer'
import ImageRenderer from './ImageRenderer'
import type { ImageViewingService } from './ImageViewingService'
import ImageViewingServiceProvider from './ImageViewingService'
import { atomOne } from './styles'

const renderers = {
  img: ImageRenderer,
  iframe: IframeRenderer,
  a: AnchorRenderer,
  pre: HorizontalScrollRenderer,
}
const snapPoints = ['90%']

const customHTMLElementModels = {
  iframe: iframeModel,
}

const defaultTextProps = { selectable: false }

function HtmlRender({
  tagsStyles,
  baseStyle,
  navigation,
  onOpenMemberInfo,
  ...props
}: RenderHTMLProps & {
  navigation: NativeStackNavigationProp<AppStackParamList>
  source: HTMLSourceInline
  onOpenMemberInfo?: (data) => void
}) {
  const { theme, colorScheme, styles: themeStyles } = useTheme()
  const alert = useAlertService()
  const viewingRef = useRef<ImageViewingService>(null)
  const selectModalRef = useRef<BottomSheetModal>()
  const base64ModalRef = useRef<BottomSheetModal>()

  const renderersProps = useMemo(
    () => ({
      iframe: {
        scalesPageToFit: true,
        webViewProps: {
          style: themeStyles.layer1,
          userAgent: USER_AGENT,
        },
      },
      table: {
        tableRenderers: true,
      },
      ul: {
        markerBoxStyle: { paddingRight: 4 },
      },
      ol: {
        markerBoxStyle: { paddingRight: 2 },
      },
    }),
    [themeStyles],
  )

  const [textToSelect, setTextToSelect] = useState('')
  const [base64Options, setBase64Options] = useState([])

  const styles = useMemo(() => {
    const baseFontSize = (baseStyle?.fontSize ||
      themeStyles.text_base.fontSize) as number
    return {
      body: {
        color: theme.colors.text,
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
      hr: {
        marginVertical: baseFontSize,
      },
      pre: {
        backgroundColor: theme.colors.html_pre_bg,
        paddingHorizontal: (12 / 16) * baseFontSize,
        paddingTop: baseFontSize * 0.8,
        lineHeight: 1.25 * baseFontSize,
        borderRadius: 4,
      },
      code: {
        fontSize: 14,
      },
      ul: {
        marginTop: 0,
      },
      p: {
        marginTop: 0,
      },
      a: {
        textDecorationLine: 'none',
        color: theme.colors.text_link,
      },
      blockquote: {
        marginLeft: 0,
        paddingLeft: baseFontSize * 1.5,
        paddingVertical: baseFontSize * 0.25,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.text,
      },
      th: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.text_meta,
      },
      ...(tagsStyles || {}),
    }
  }, [tagsStyles, baseStyle, themeStyles, theme])

  const renderContext = useMemo(
    () => ({
      handleUrlPress: (payload: {
        interaction: 'default' | 'preview' | 'default'
        url: string
      }) => {
        if (payload.interaction !== 'default') {
          return
        }
        const { url } = payload
        if (isAppLink(url)) {
          const screen = getScreenInfo(url)
          if (screen) {
            if (screen.name === 'member' && onOpenMemberInfo) {
              onOpenMemberInfo({
                type: 'member',
                data: screen.params.username,
              })
              return
            }
            navigation.push(screen.name, screen.params)
            return
          }
        }
        if (isImgurResourceLink(url) && viewingRef.current) {
          viewingRef.current.open(getImgurResourceImageLink(url))
          return
        }
        if (url.startsWith('mailto:')) {
          Linking.openURL(url)
          return
        }
        if (Platform.OS == 'ios') {
          WebBrowser.openBrowserAsync(url, {
            controlsColor: theme.colors.primary,
            dismissButtonStyle: 'close',
            presentationStyle:
              WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          }).catch((err) => {
            Sentry.captureException(err)
          })
        } else {
          navigation.push('browser', {
            url,
          })
        }
      },
    }),
    [navigation, onOpenMemberInfo],
  )

  const handleQrCode = useCallback((result: BarCodeScannerResult) => {
    const { data } = result
    if (isAppLink(data)) {
      const screen = getScreenInfo(data)
      if (screen) {
        navigation.push(screen.name, screen.params)
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
            alert.show({
              type: 'success',
              message: '已复制到粘贴板',
            })
          },
        },
      ])
    }
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      const content = htmlToMarkdown(props.source.html)
      await Clipboard.setStringAsync(content)
      alert.show({
        type: 'success',
        message: '已复制到粘贴板',
        duration: 500,
      })
    } catch (err) {
      Sentry.captureException(err)
    }
  }, [props.source.html])

  const copyAndNotice = useCallback(async (text) => {
    await Clipboard.setStringAsync(text)
    alert.show({
      type: 'success',
      message: '已复制到粘贴板: ' + text,
    })
  }, [])

  const handleBase64Decode = useCallback(() => {
    try {
      const content = htmlToMarkdown(props.source.html)
      const result = extractBase64Decoded(content)
      if (result && result.length) {
        if (result.length == 1) {
          const item = result[0]
          copyAndNotice(item[1])
        } else {
          setBase64Options(result)
          base64ModalRef.current?.present()
        }
      } else {
        alert.show({
          type: 'info',
          message: '未找到 base64 字符串',
        })
      }
    } catch (err) {
      alert.show({
        type: 'error',
        message: '未识别到有效内容',
      })
      Sentry.addBreadcrumb({
        data: {
          text: props.source.html,
        },
      })
      Sentry.captureException(err)
    }
  }, [props.source.html])

  const handleSelect = useCallback(() => {
    const content = htmlToMarkdown(props.source.html)
    setTextToSelect(content)
    selectModalRef.current.present()
  }, [props.source.html])

  return (
    <ImageViewingServiceProvider ref={viewingRef} handleQrCode={handleQrCode}>
      <RenderContext.Provider value={renderContext}>
        <View style={{ margin: -6 }}>
          <ContextMenu.Root>
            <ContextMenu.Trigger>
              <View style={[{ padding: 6 }]}>
                <BaseRender
                  WebView={WebView}
                  tagsStyles={styles}
                  renderers={renderers}
                  renderersProps={renderersProps}
                  defaultTextProps={defaultTextProps}
                  customHTMLElementModels={customHTMLElementModels}
                  bypassAnonymousTPhrasingNodes={false}
                  classesStyles={atomOne[colorScheme]}
                  {...props}
                />
              </View>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
              <ContextMenu.Group>
                <ContextMenu.Item key="copy" onSelect={handleCopy}>
                  <ContextMenu.ItemTitle>复制</ContextMenu.ItemTitle>
                  <ContextMenu.ItemIcon
                    ios={{
                      name: 'doc.on.doc',
                    }}></ContextMenu.ItemIcon>
                </ContextMenu.Item>
                <ContextMenu.Item key="select-text" onSelect={handleSelect}>
                  <ContextMenu.ItemTitle>选择文本</ContextMenu.ItemTitle>
                  <ContextMenu.ItemIcon
                    ios={{
                      name: 'hand.point.up.left.and.text',
                    }}></ContextMenu.ItemIcon>
                </ContextMenu.Item>
                <ContextMenu.Item
                  key="base64-decode"
                  onSelect={handleBase64Decode}>
                  <ContextMenu.ItemTitle>Base64 提取</ContextMenu.ItemTitle>
                  <ContextMenu.ItemIcon
                    ios={{ name: 'text.viewfinder' }}></ContextMenu.ItemIcon>
                </ContextMenu.Item>
              </ContextMenu.Group>
            </ContextMenu.Content>
          </ContextMenu.Root>
        </View>
      </RenderContext.Provider>
      <MyBottomSheetModal
        ref={selectModalRef}
        index={0}
        snapPoints={snapPoints}>
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingBottom: 44,
            paddingTop: 16,
            paddingHorizontal: 16,
          }}>
          {Platform.OS == 'ios' ? (
            <TextInput
              style={styles.body}
              value={textToSelect}
              readOnly
              multiline
              selectionColor={theme.colors.primary}
            />
          ) : (
            <Text
              style={styles.body}
              selectable
              selectionColor={Color(theme.colors.primary)
                .alpha(0.15)
                .toString()}>
              {textToSelect}
            </Text>
          )}
        </BottomSheetScrollView>
      </MyBottomSheetModal>
      <MyBottomSheetModal
        ref={base64ModalRef}
        index={0}
        snapPoints={['50%', '90%']}>
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingBottom: 44,
            paddingTop: 16,
            paddingHorizontal: 16,
          }}>
          <View className="flex-row w-full">
            <View className="flex-1 py-2" style={themeStyles.border_b}>
              <Text
                style={[
                  themeStyles.text,
                  themeStyles.text_base,
                  { fontWeight: 'bold' },
                ]}>
                字符串
              </Text>
            </View>
            <View className="flex-1 py-2" style={themeStyles.border_b}>
              <Text
                style={[
                  themeStyles.text,
                  themeStyles.text_base,
                  { fontWeight: 'bold' },
                ]}>
                解码内容
              </Text>
            </View>
          </View>
          {base64Options.map((item) => (
            <Pressable
              key={item[0]}
              className="flex-row w-full"
              onPress={() => {
                base64ModalRef.current?.dismiss()
                copyAndNotice(item[1])
              }}>
              <View className="flex-1 py-2" style={themeStyles.border_b}>
                <Text style={[themeStyles.text, themeStyles.text_base]}>
                  {item[0]}
                </Text>
              </View>
              <View className="flex-1 py-2" style={themeStyles.border_b}>
                <Text style={[themeStyles.text, themeStyles.text_base]}>
                  {item[1]}
                </Text>
              </View>
            </Pressable>
          ))}
          <View className="mt-3">
            <Text style={[themeStyles.text, themeStyles.text_sm]}>
              点击选择复制
            </Text>
          </View>
        </BottomSheetScrollView>
      </MyBottomSheetModal>
    </ImageViewingServiceProvider>
  )
}

export default HtmlRender
