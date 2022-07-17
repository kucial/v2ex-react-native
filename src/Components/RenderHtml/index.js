import { useNavigation } from '@react-navigation/native'
import { useCallback } from 'react'
import BaseRender, { useInternalRenderer } from 'react-native-render-html'
import { useTailwind } from 'tailwindcss-react-native'
import ImageElement from './ImageElement'

const ImageRenderer = (props) => {
  const { rendererProps } = useInternalRenderer('img', props)
  return <ImageElement {...rendererProps} />
}

const getMemberName = (href) => {
  const match = /about:\/\/\/member\/(\w*)$/.exec(href)
  return match?.[1]
}

export default function RenderHtml({ tagsStyles = {}, ...props }) {
  const tw = useTailwind()
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
    <BaseRender
      tagsStyles={{
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
        ...tagsStyles
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
