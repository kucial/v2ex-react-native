import { memo, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useNavigation } from '@react-navigation/native'
import BaseRender, { useInternalRenderer } from 'react-native-render-html'
import { useTailwind } from 'tailwindcss-react-native'
import { isAppLink, getScreenInfo } from '@/utils/url'

import ImageElement from './ImageElement'

const ImageRenderer = (props) => {
  const { rendererProps } = useInternalRenderer('img', props)
  return <ImageElement {...rendererProps} />
}

const renderers = {
  img: ImageRenderer
}

const defaultTextProps = { selectable: true }

function RenderHtml({ tagsStyles, baseStyle, ...props }) {
  const tw = useTailwind()
  const navigation = useNavigation()

  const styles = useMemo(() => {
    const baseFontSize = baseStyle?.fontSize || 16
    return {
      body: {
        ...tw('text-gray-700'),
        fontSize: baseFontSize,
        lineHeight: baseFontSize * 1.33
      },
      h1: {
        fontSize: (28 / 16) * baseFontSize,
        lineHeight: (28 / 16) * baseFontSize * 1.1,
        marginTop: 1.25 * baseFontSize,
        marginBottom: baseFontSize
      },
      h2: {
        fontSize: (24 / 16) * baseFontSize,
        lineHeight: (24 / 16) * baseFontSize * 1.1,
        marginTop: 1.25 * baseFontSize,
        marginBottom: baseFontSize
      },
      h3: {
        fontSize: (20 / 16) * baseFontSize,
        lineHeight: (20 / 16) * baseFontSize * 1.1,
        marginTop: 1.25 * baseFontSize,
        marginBottom: baseFontSize
      },
      h4: {
        fontSize: (18 / 16) * baseFontSize,
        lineHeight: (18 / 16) * baseFontSize * 1.1,
        marginTop: baseFontSize / 1.5,
        marginBottom: baseFontSize / 2
      },
      h5: {
        fontSize: (16 / 16) * baseFontSize,
        lineHeight: (16 / 16) * baseFontSize * 1.1,
        marginVertical: baseFontSize / 2
      },
      h6: {
        fontSize: (14 / 16) * baseFontSize,
        lineHeight: (14 / 16) * baseFontSize * 1.1,
        marginVertical: baseFontSize / 2
      },
      hr: {
        marginVertical: baseFontSize
      },
      pre: {
        backgroundColor: '#f6f6f6',
        paddingHorizontal: (12 / 16) * baseFontSize,
        lineHeight: 1.25 * baseFontSize
      },
      code: tw('text-sm'),
      ul: {
        paddingLeft: 12,
        marginTop: 0
      },
      li: {
        lineHeight: 1.5 * baseFontSize
      },
      p: {
        marginTop: 0,
        lineHeight: 1.25 * baseFontSize,
        marginBottom: baseFontSize
      },
      a: tw('no-underline'),
      blockquote: {
        marginLeft: 0,
        paddingLeft: baseFontSize * 1.5,
        paddingVertical: baseFontSize * 0.25,
        borderLeftWidth: 2,
        borderLeftColor: '#111111'
      },
      ...(tagsStyles || {})
    }
  }, [tagsStyles, baseStyle])
  const renderersProps = useMemo(() => {
    return {
      a: {
        onPress: (e, href) => {
          console.log('anchor href', href)
          if (isAppLink(href)) {
            const screen = getScreenInfo(href)
            if (screen) {
              navigation.push(screen.name, screen.params)
              return
            }
          }
          // TODO: user preference
          navigation.push('browser', {
            url: href
          })
        }
      }
    }
  }, [])

  return (
    <BaseRender
      tagsStyles={styles}
      renderers={renderers}
      renderersProps={renderersProps}
      defaultTextProps={defaultTextProps}
      {...props}
    />
  )
}

RenderHtml.propTypes = {
  tagsStyles: PropTypes.object,
  baseStyle: PropTypes.object
}

RenderHtml.defaultProps = {
  baseStyle: {
    fontSize: 16
  }
}

export default memo(RenderHtml)
