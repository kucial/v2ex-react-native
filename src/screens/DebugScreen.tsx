import { useCallback, useMemo, useRef } from 'react'
import {
  Dimensions,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { SelectableText } from '@alentoma/react-native-selectable-text'

import ErrorNotice from '@/components/ErrorNotice'
import HtmlRender from '@/components/HtmlRender'
import { useTheme } from '@/containers/ThemeService'

const fSize = 30
const p = {
  lineHeight: fSize * 1.7,
  fontSize: fSize,
  color: 'white',
  paddingBottom: 5,
  textAlign: 'left',
}

const classes = {
  paddingLeft: fSize * 0.9,
  paddingRight: fSize * 0.95,
  backgroundColor: 'black',
  minWidth: Dimensions.get('window').width,
  minHeight: Dimensions.get('window').height,
  maxWidth: '99%',
  overflow: 'hidden',
  flex: 1,
}

const INDICATOR_WIDTH = 64
const INDICATOR_HEIGHT = 64

export default function DebugScreen(props) {
  // ref
  const { theme, styles } = useTheme()

  // renders
  // return null

  return (
    <SafeAreaView style={[{ flex: 1 }, styles.layer1]}>
      <View>
        <HtmlRender
          contentWidth={Dimensions.get('window').width}
          source={{
            html: '<div><p>这是一段测试文本</p><img src="https://www.kongkx.com/sites/default/files/inline-images/Fantom.png" /></div>',
          }}
          navigation={props.navigation}
        />
      </View>
    </SafeAreaView>
  )
}
