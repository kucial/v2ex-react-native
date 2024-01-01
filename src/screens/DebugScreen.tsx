import { useEffect, useRef } from 'react'
import { Dimensions, SafeAreaView, Text, View } from 'react-native'

import Button from '@/components/Button'
import HeartIcon from '@/components/HeartIcon'
import HtmlRender from '@/components/HtmlRender'
import Loader from '@/components/Loader'
import StarIcon from '@/components/StarIcon'
import { useAuthService } from '@/containers/AuthService'
import { useTheme } from '@/containers/ThemeService'
import { getCurrentUser } from '@/utils/v2ex-client'

const fSize = 30
const p = {
  lineHeight: fSize * 1.7,
  fontSize: fSize,
  color: 'white',
  paddingBottom: 5,
  textAlign: 'left',
}

export default function DebugScreen(props) {
  // ref
  const { theme, styles } = useTheme()

  const { user } = useAuthService()
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
    <SafeAreaView style={[{ flex: 1 }, styles.layer1]}>
      <View>
        <Text>Current User: {user?.username}</Text>
      </View>
      <View>
        <HtmlRender
          contentWidth={Dimensions.get('window').width}
          source={{
            html: '<div><p>这是一段测试文本</p><img src="https://www.kongkx.com/sites/default/files/inline-images/Fantom.png" /></div>',
          }}
          navigation={props.navigation}
        />
        <Loader />
        <Button
          size="md"
          variant="icon"
          onPress={() => {
            starIconRef.current?.play()
          }}>
          <StarIcon ref={starIconRef} />
        </Button>
        <Button
          size="md"
          variant="icon"
          onPress={() => {
            heartIconRef.current?.play()
          }}>
          <HeartIcon ref={heartIconRef} />
        </Button>
      </View>
    </SafeAreaView>
  )
}
