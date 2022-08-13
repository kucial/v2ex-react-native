import { useNavigation } from '@react-navigation/native'
import { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import BaseRender, { useInternalRenderer } from 'react-native-render-html'
import { useTailwind } from 'tailwindcss-react-native'
import ImageElement from './ImageElement'

const ImageRenderer = (props) => {
  const { rendererProps } = useInternalRenderer('img', props)
  return <ImageElement {...rendererProps} />
}

const getMemberName = (href) => {
  const match = /\/member\/(\w*)$/.exec(href)
  return match?.[1]
}

const getTopicId = (href) => {
  const match = /https:\/\/(?:www\.)v2ex.com\/t\/(\w*)?(#\w+)?$/.exec(href)
  return match?.[1]
}

const renderers = {
  img: ImageRenderer
}

const defaultTextProps = { selectable: true }

export default function RenderHtml({ tagsStyles, ...props }) {
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
          console.log('anchor href', e)
          if (new RegExp('^https://(www.)?v2ex.com').test(href)) {
            const memberName = getMemberName(href)
            if (memberName) {
              navigation.push('member', {
                username: memberName
              })
            }
            console.log(href)
            const topicId = getTopicId(href)
            console.log(topicId)
            if (topicId) {
              navigation.push('topic', {
                id: topicId
              })
            }
          } else {
            // TODO: user preference
            // Linking.openURL(href)
            navigation.push('browser', {
              url: href
            })
          }
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
  tagsStyles: PropTypes.object
}
