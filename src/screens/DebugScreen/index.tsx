import { useEffect, useRef } from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Button from '@/components/Button'
import HeartIcon from '@/components/HeartIcon'
import HtmlRender from '@/components/HtmlRender'
import Loader from '@/components/Loader'
import StarIcon from '@/components/StarIcon'

import { useTheme } from '@/containers/ThemeService'
import { useCurrentUser } from '@/stores/auth'
import { getCurrentUser } from '@/utils/v2ex-client'

const fSize = 30
const p = {
  lineHeight: fSize * 1.7,
  fontSize: fSize,
  color: 'white',
  paddingBottom: 5,
  textAlign: 'left',
}

export default function DebugScreen() {
  // ref
  const { theme, styles } = useTheme()
  const insets = useSafeAreaInsets()

  const user = useCurrentUser()
  const starIconRef = useRef()
  const heartIconRef = useRef()

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        console.error(err)
      })
  }, [])

  // renders
  // return null

  return (
    <View
      style={[
        debugStyles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        styles.layer1,
      ]}
    >
      <View>
        <Text style={styles.text}>Current User: {user?.username}</Text>
      </View>
      <View>
        <HtmlRender
          contentWidth={Dimensions.get('window').width}
          source={{
            html: `<div><p>这是一段测试文本 <a href="https://www.kongkx.com">TEST LINK</a> Inline test</p><img src="https://www.kongkx.com/sites/default/files/inline-images/Fantom.png" /></div>`,
          }}
        />
        <Loader />
        <Button
          size='md'
          variant='icon'
          onPress={() => {
            starIconRef.current?.play()
          }}
        >
          <StarIcon ref={starIconRef} />
        </Button>
        <Button
          size='md'
          variant='icon'
          onPress={() => {
            heartIconRef.current?.play()
          }}
        >
          <HeartIcon ref={heartIconRef} />
        </Button>
      </View>
    </View>
  )
}

const debugStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
