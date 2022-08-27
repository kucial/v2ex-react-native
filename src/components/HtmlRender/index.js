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
const baseStyle = {
  fontSize: 16
  // lineHeight: 21
}

function RenderHtml({ tagsStyles, ...props }) {
  const tw = useTailwind()
  const navigation = useNavigation()

  const styles = useMemo(
    () => ({
      body: tw('text-gray-700'),
      // h2: tw('text-xl'),
      // h3: tw('text-lg'),
      // h2: tw('border-b pb-[6px] border-gray-300'),
      pre: { backgroundColor: '#f6f6f6', padding: 12 },
      code: tw('text-sm'),
      ul: {
        paddingLeft: 12
      },
      a: tw('no-underline'),
      ...(tagsStyles || {})
    }),
    [tagsStyles]
  )
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
      baseStyle={baseStyle}
      {...props}
    />
  )
}

RenderHtml.propTypes = {
  tagsStyles: PropTypes.object
}
export default memo(RenderHtml)
