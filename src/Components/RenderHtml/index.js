import { useNavigation } from '@react-navigation/native'
import { useCallback } from 'react'
import RenderHtml, { useInternalRenderer } from 'react-native-render-html'
import ImageElement from './ImageElement'

const ImageRenderer = (props) => {
  const { rendererProps } = useInternalRenderer('img', props)
  return <ImageElement {...rendererProps} />
}

const getMemberName = (href) => {
  const match = /about:\/\/\/member\/(\w*)$/.exec(href)
  return match?.[1]
}

export default function WrappedRenderHtml(props) {
  const navigation = useNavigation()
  const handleAnchorPress = useCallback((e, href) => {
    if (/about:\/\//.test(href)) {
      const memberName = getMemberName(href)
      if (memberName) {
        navigation.navigate('member', {
          username: memberName
        })
      }
    } else {
      // TODO: user preference
      // Linking.openURL(href)
      navigation.navigate('browser', {
        url: href
      })
    }
  }, [])
  return (
    <RenderHtml
      tagsStyles={{
        body: {
          fontSize: 16,
          color: '#333'
        },
        div: {
          lineHeight: '1.5em',
          marginBottom: 6
        },
        p: {
          lineHeight: '1.5em',
          marginBottom: 6
        },
        h2: {
          borderBottomColor: '#e8e8e8',
          borderBottomWidth: 1,
          paddingBottom: 6
        },
        pre: { backgroundColor: '#f6f6f6', padding: 12 },
        code: { fontSize: 14, marginBottom: 0 },
        ul: {
          paddingLeft: 12
        }
      }}
      renderers={{
        img: ImageRenderer
      }}
      renderersProps={{
        a: {
          onPress: handleAnchorPress
        }
      }}
      {...props}
    />
  )
}
