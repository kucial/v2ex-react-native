import { useMemo, useRef } from 'react'
import BaseRender, { useInternalRenderer } from 'react-native-render-html'
import WebView from 'react-native-webview'
import IframeRenderer, { iframeModel } from '@native-html/iframe-plugin'
import { useNavigation } from '@react-navigation/native'
import * as Clipboard from 'expo-clipboard'
import * as WebBrowser from 'expo-web-browser'
import { decode } from 'js-base64'
import PropTypes from 'prop-types'
import * as Sentry from 'sentry-expo'
import colors from 'tailwindcss/colors'
import { useColorScheme } from 'tailwindcss-react-native'

import { useAlertService } from '@/containers/AlertService'
import {
  getImgurPostImageLink,
  getScreenInfo,
  isAppLink,
  isImgurPostLink,
} from '@/utils/url'

import AnchorRenderer from './AnchorRenderer'
import { RenderContext } from './context'
import ImageElement from './ImageElement'
import ImageViewingService from './ImageViewingService'
import TextRenderer from './TextRenderer'

const ImageRenderer = (props) => {
  const { rendererProps } = useInternalRenderer('img', props)
  return <ImageElement {...rendererProps} />
}

const renderers = {
  img: ImageRenderer,
  iframe: IframeRenderer,
  _TEXT_: TextRenderer,
  a: AnchorRenderer,
}

const customHTMLElementModels = {
  iframe: iframeModel,
}

const defaultTextProps = { selectable: false }

const MENU_ITEM_COPY = '复制'
const MENU_ITEM_BASE64_DECODE = 'Base64 解码'

function RenderHtml({ tagsStyles, baseStyle, ...props }) {
  const { colorScheme } = useColorScheme()
  const navigation = useNavigation()
  const alert = useAlertService()
  const viewingRef = useRef()

  const styles = useMemo(() => {
    const baseFontSize = baseStyle?.fontSize || 16
    return {
      body: {
        color:
          colorScheme === 'dark' ? colors.neutral[300] : colors.neutral[700],
        fontSize: baseFontSize,
        lineHeight: baseFontSize * 1.33,
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
        backgroundColor:
          colorScheme === 'dark' ? colors.neutral[800] : colors.neutral[100],
        paddingHorizontal: (12 / 16) * baseFontSize,
        lineHeight: 1.25 * baseFontSize,
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
        lineHeight: 1.25 * baseFontSize,
        marginBottom: baseFontSize,
      },
      a: {
        textDecorationLine: 'none',
        color: colorScheme === 'dark' ? colors.sky[300] : colors.blue[600],
      },
      blockquote: {
        marginLeft: 0,
        paddingLeft: baseFontSize * 1.5,
        paddingVertical: baseFontSize * 0.25,
        borderLeftWidth: 2,
        borderLeftColor:
          colorScheme === 'dark' ? colors.neutral[300] : colors.neutral[900],
      },
      ...(tagsStyles || {}),
    }
  }, [tagsStyles, baseStyle, colorScheme])
  const renderersProps = useMemo(() => {
    return {
      // a: {
      //   onPress: (e, href) => {
      //     if (isAppLink(href)) {
      //       const screen = getScreenInfo(href)
      //       if (screen) {
      //         navigation.push(screen.name, screen.params)
      //         return
      //       }
      //     }
      //     WebBrowser.openBrowserAsync(href).catch((err) => {
      //       captureException(err)
      //       console.log(err)
      //     })
      //   }
      // },
      iframe: {
        scalesPageToFit: true,
      },
    }
  }, [])

  const renderContext = useMemo(
    () => ({
      menuItems: [MENU_ITEM_COPY, MENU_ITEM_BASE64_DECODE],
      handleUrlPress: (payload) => {
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
        if (isImgurPostLink(url) && viewingRef.current) {
          console.log(viewingRef.current)
          viewingRef.current.open(getImgurPostImageLink(url))
          return
          // OPEN URL
        }
        WebBrowser.openBrowserAsync(url).catch((err) => {
          Sentry.Native.captureException(err)
          console.log(err)
        })
      },
      handleSelection: async (payload) => {
        console.log(payload)
        const { eventType, content } = payload
        switch (eventType) {
          case `R_${MENU_ITEM_COPY}`:
            try {
              await Clipboard.setStringAsync(content)
              alert.alertWithType('success', '已复制到粘贴板')
            } catch (err) {
              Sentry.Native.captureException(err)
            }
            break
          case `R_${MENU_ITEM_BASE64_DECODE}`:
            try {
              const result = decode(content)
              if (result) {
                await Clipboard.setStringAsync(result)
                alert.alertWithType('success', '已复制到粘贴板', result)
              } else {
                alert.alertWithType('error', '未识别到有效内容')
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
    [],
  )

  return (
    <ImageViewingService ref={viewingRef}>
      <RenderContext.Provider value={renderContext}>
        <BaseRender
          WebView={WebView}
          tagsStyles={styles}
          renderers={renderers}
          renderersProps={renderersProps}
          defaultTextProps={defaultTextProps}
          customHTMLElementModels={customHTMLElementModels}
          bypassAnonymousTPhrasingNodes={false}
          {...props}
        />
      </RenderContext.Provider>
    </ImageViewingService>
  )
}

RenderHtml.propTypes = {
  tagsStyles: PropTypes.object,
  baseStyle: PropTypes.object,
}

RenderHtml.defaultProps = {
  baseStyle: {
    fontSize: 16,
  },
}

export default RenderHtml
