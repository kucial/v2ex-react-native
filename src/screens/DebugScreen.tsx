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
    <View style={[{ flex: 1 }, styles.layer1]}>
      <SafeAreaView style={{ flex: 1 }}>
        <Text>TODO....</Text>
        <Text>
          <Text url="https://www.baidu.com">测试一下</Text>
        </Text>
        <HtmlRender
          navigation={props.navigation}
          source={{
            html: '<p><a href="https://www.feat.com">kongkx</a></p>',
          }}
        />
      </SafeAreaView>
    </View>
  )
}
