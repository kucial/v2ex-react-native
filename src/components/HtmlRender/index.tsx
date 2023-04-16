import { useCallback, useMemo, useRef } from 'react'
import { Alert, Linking } from 'react-native'
import BaseRender, { RenderHTMLProps } from 'react-native-render-html'
import WebView from 'react-native-webview'
import IframeRenderer, { iframeModel } from '@native-html/iframe-plugin'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { BarCodeScannerResult } from 'expo-barcode-scanner'
import * as Clipboard from 'expo-clipboard'
import * as WebBrowser from 'expo-web-browser'
import { decode } from 'js-base64'
import PropTypes from 'prop-types'
import * as Sentry from 'sentry-expo'

import { useAlertService } from '@/containers/AlertService'
import { useTheme } from '@/containers/ThemeService'
import { getMaxLength } from '@/utils/content'
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
import HorizontalScrollRenderer from './HorizontalScrollRenderer'
import ImageRenderer from './ImageRenderer'
import type { ImageViewingService } from './ImageViewingService'
import ImageViewingServiceProvider from './ImageViewingService'
import { atomOne } from './styles'
import TextRenderer from './TextRenderer'

const renderers = {
  img: ImageRenderer,
  iframe: IframeRenderer,
  _TEXT_: TextRenderer,
  a: AnchorRenderer,
  pre: HorizontalScrollRenderer,
}

const customHTMLElementModels = {
  iframe: iframeModel,
}

const defaultTextProps = { selectable: false }

const MENU_ITEM_COPY = '复制'
const MENU_ITEM_BASE64_DECODE = 'Base64 解码'

function HtmlRender({
  tagsStyles,
  baseStyle,
  navigation,
  ...props
}: RenderHTMLProps & {
  navigation: NativeStackNavigationProp<AppStackParamList>
}) {
  const { theme, colorScheme } = useTheme()
  const alert = useAlertService()
  const viewingRef = useRef<ImageViewingService>(null)

  const styles = useMemo(() => {
    const baseFontSize = (baseStyle?.fontSize || 16) as number
    return {
      body: {
        color: theme.colors.text,
        fontSize: baseFontSize,
        lineHeight: baseFontSize * 1.4,
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
        paddingLeft: 12,
        marginTop: 0,
      },
      li: {
        lineHeight: 1.5 * baseFontSize,
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
      ...(tagsStyles || {}),
    }
  }, [tagsStyles, baseStyle, theme])

  const renderersProps = useMemo(() => {
    return {
      iframe: {
        scalesPageToFit: true,
      },
    }
  }, [])

  const renderContext = useMemo(
    () => ({
      menuItems: [MENU_ITEM_COPY, MENU_ITEM_BASE64_DECODE],
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
            navigation.push(screen.name, screen.params)
            return
          }
        }
        if (isImgurResourceLink(url) && viewingRef.current) {
          console.log(viewingRef.current)
          viewingRef.current.open(getImgurResourceImageLink(url))
          return
          // OPEN URL
        }
        if (url.startsWith('mailto:')) {
          Linking.openURL(url)
          return
        }
        WebBrowser.openBrowserAsync(url, {
          controlsColor: theme.colors.primary,
          dismissButtonStyle: 'close',
        }).catch((err) => {
          Sentry.Native.captureException(err)
          console.log(err)
        })
      },
      handleSelection: async (payload: {
        eventType: string
        content: string
      }) => {
        const { eventType, content } = payload
        switch (eventType) {
          case `R_${MENU_ITEM_COPY}`:
            try {
              await Clipboard.setStringAsync(content)
              // alert.show({ type: 'success', message: '已复制到粘贴板 ' })
            } catch (err) {
              Sentry.Native.captureException(err)
            }
            break
          case `R_${MENU_ITEM_BASE64_DECODE}`:
            try {
              const result = decode(content)
              if (result) {
                await Clipboard.setStringAsync(result)
                alert.show({
                  type: 'success',
                  message: '已复制到粘贴板: ' + result,
                })
              } else {
                alert.show({
                  type: 'error',
                  message: '未识别到有效内容 ',
                })
              }
            } catch (err) {
              Sentry.Native.captureException(err)
            }
            break
          default:
            console.log('TO HANDLE SELECTION', payload)
        }
      },
    }),
    [navigation],
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

  return (
    <ImageViewingServiceProvider ref={viewingRef} handleQrCode={handleQrCode}>
      <RenderContext.Provider value={renderContext}>
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
      </RenderContext.Provider>
    </ImageViewingServiceProvider>
  )
}

HtmlRender.propTypes = {
  tagsStyles: PropTypes.object,
  baseStyle: PropTypes.object,
}

HtmlRender.defaultProps = {
  baseStyle: {
    fontSize: 16,
  },
}

export default HtmlRender
